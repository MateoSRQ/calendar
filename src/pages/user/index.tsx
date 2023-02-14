import {useEffect, useState, Suspense, unstable_batchUpdates} from 'react'
import styles from './index.module.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {addDays, addMinutes, format} from 'date-fns'
//import oData from './data.json'
import 'antd/dist/reset.css';
import {Typography, Table, Tag, Col, Row, Input, Modal, Form} from "antd";
import axios from 'axios'
import "@fontsource/roboto-condensed"
import "@fontsource/passion-one"
import { BrowserRouter as Router, Switch, Route, Link, useParams, useLocation } from "react-router-dom";

const TextArea = Input.TextArea

const Schedule = (props: any) => {

    const cellClick = (e: any) => {
        props.onChangeData(e)
    }

    let today = format(new Date, 'yyyy-MM-dd')
    let now = format(addMinutes(new Date, 15),  'HH:mm')
    let cdata = []
    for (let i = 0; i < props?.items?.length; i++) {
        let element
        if (props.day == today && props.items[i].hInicio <= now) {
            props.items[i].estado = 'Ocupado'
        }

        switch (props.items[i].estado) {
            case 'libre':
                element =
                    <Col key={Math.random()} span={6} >
                        <div
                            style={{
                                outline: '.5px rgba(0, 0, 0, 0.16) solid',
                                color: 'green',
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(255,255,255,0.58)', cursor: 'pointer'}}
                            className={styles.item}
                            onClick={() => {cellClick(props.items[i].hInicio)}}
                        >{props.items[i].hInicio + " - " + props.items[i].hFin}</div>
                    </Col>
                break;
            default:
                element =
                    <Col key={Math.random()} span={6} >
                        <div style={{
                            outline: '.5px rgba(0, 0, 0, 0.16) solid',
                            color: 'gray',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(238,238,238,0.58)',
                            opacity: '.6'
                        }} className={styles.item} >
                            <div>{props.items[i].hInicio + " - " + props.items[i].hFin}</div>
                            <div style={{fontSize: '.6rem', fontStyle: 'italic', textTransform: 'uppercase'}}>Horario no disponible</div>
                        </div>
                    </Col>
                break;
        }

        cdata.push(element)
    }

    return (
        <Row gutter={16} className={styles.grid}>
            {cdata}
        </Row>
    )
}

function Component() {
    const [currentDay, setCurrentDay] = useState(format(new Date, 'yyyy-MM-dd'))
    const [data, setData] = useState(null);
    const [code, setCode] = useState(202001)
    //const [user, setUser] = useState({name: '', email: ''})
    const [comment, setComment] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const user = useParams();
    const y = useLocation();


    console.log(JSON.stringify(user))
    const ip = import.meta.env.VITE_COUCH_IP

    useEffect(() => {
        (async () => {
            const d = await axios.get('http://' + ip + ':5984/citas/_all_docs?include_docs=true', {
                auth: {
                    username: 'admin',
                    password: 'admin'
                }
            })
            setData(d.data.rows[0].doc)
        })()
    }, []);
    const handleOk = () => {
        setIsModalOpen(false)
    }

    const handleConfirmOk = () => {
        setIsConfirmOpen(false)
    }
    const changeData = async (e: any) => {
        if (user.name && comment) {
            let items = {...data};
            let c = 0
            let list = []
            for (const fecha in items["Piura"].fechas) {
                list = items["Piura"].fechas[fecha].filter((it: any) => {
                    return it.code == user.code
                });
                c = c + list.length
            }
            console.log('list')
            console.log(list)
            console.log("c = " + c)
            if (c) {
                setIsModalOpen(true)
                return
            }

            // @ts-ignore
            let l = (items["Piura"].fechas[currentDay].length)
            // @ts-ignore
            for (let i = 0; i < items["Piura"].fechas[currentDay].length; i++) {
                // @ts-ignore
                if (items["Piura"].fechas[currentDay][i]?.hInicio == e.substring(0, 5)) {
                    // @ts-ignore
                    items["Piura"].fechas[currentDay][i].estado = "Ocupado"
                    // @ts-ignore
                    items["Piura"].fechas[currentDay][i].usuario = user.name
                    // @ts-ignore
                    items["Piura"].fechas[currentDay][i].email = user.email
                    // @ts-ignore
                    items["Piura"].fechas[currentDay][i].code = user.code
                    // @ts-ignore
                    items["Piura"].fechas[currentDay][i].comment = comment
                }
            }

            let n = await axios.put('http://' + import.meta.env.VITE_COUCH_IP + ':5984/citas/' + import.meta.env.VITE_COUCH_ID,
                {
                    //"_rev": "2-3cabd9766a035ddd7395f42fbb86520b",
                    "_rev": data._rev,
                    ...items
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin'
                    }
                })
            //unstable_batchUpdates(() => {
                setData(items)
                setIsConfirmOpen(true)
            //})
        }
        else {
            alert('Por favor, describa la razón de su cita')
        }
    }
    const tile = (date: Date) => {
        let fdate = format(date, 'yyyy-MM-dd')
        // @ts-ignore
        if (data && data["Piura"]?.fechas[fdate]) {
            // @ts-ignore
            let _empty = data["Piura"].fechas[fdate].filter((d: any) => {
                return d.estado == "libre"
            })
            return (_empty.length == 0)
        } else {
            return true
        }
    }

    const clickDay = (day: any) => {
        setCurrentDay(format(day, 'yyyy-MM-dd'))
    }

    const changeCode = (e: any) => {
        // @ts-ignore
        if (users[e.target.value] && users[e.target.value].name != '' ) {
            // @ts-ignore
            setUser({name: users[e.target.value].name, email: users[e.target.value].email})
        }
        setCode(e.target.value)
    }

    const changeComment = (e: any) => {
        setComment(e.target.value)
    }

    let list = null
    if (data) {
        for (const fecha in data["Piura"].fechas) {
            console.log("fecha " + fecha)

            for (let i=0; i  < data["Piura"].fechas[fecha].length; i++) 
            {
                if (data["Piura"].fechas[fecha][i].code == user.code) {
                    //list.push({...data["Piura"].fechas[fecha][i], fecha: fecha })
                    if (!list) list = [];
                    list.push(
                        <Col key={Math.random()} span={24} >
                        <div style={{
                            outline: '.5px rgba(0, 0, 0, 0.16) solid',
                            color: 'gray',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(238,238,238,0.58)',
                            opacity: '.6'
                        }} className={styles.item} >
                            <div style={{fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: '#003659'}}>{fecha}</div>
                            <div style={{fontSize: '.80rem', fontStyle: 'italic', textTransform: 'uppercase', color: 'black'}}>{data["Piura"].fechas[fecha][i].hInicio + " - " + data["Piura"].fechas[fecha][i].hFin}</div>
                            <div style={{fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: '#003659'}}>{data["Piura"].fechas[fecha][i].enlace}</div>
                            <div style={{fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: '#003659'}}>{data["Piura"].fechas[fecha][i].comment}</div>
                            <div style={{fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: '#003659'}}>{data["Piura"].fechas[fecha][i].estado}</div>
                        </div>
                    </Col>
                    )
                }
            }

        }
        console.log('list')
        console.log(list)
    }
    else {
        console.log('lis is empty') 
    }

    return (
        <div className={styles.component}>
            {/*<img style={{width: '50%'}} src='./logo.png' />*/}
            <h1 style={{
                color: '#003659',
                marginBottom: '30px',
                marginTop: '20px',
                fontFamily: 'Roboto Condensed',
                fontSize: '40px',
                fontWeight: '900',
                letterSpacing: '-2px',
                textTransform: "uppercase"
            }}>Gestión
                de Citas</h1>
                {list &&
                <h3 style={{
                    color: '#003659',
                    marginBottom: '5px',
                    marginTop: '30px',
                    textTransform: "uppercase",
                    fontFamily: 'Roboto Condensed',
                    fontSize: '20px',
                    fontWeight: '900',
                    letterSpacing: '-.2px'
                }}>
                    Listado de Citas
                </h3>
                }
                    { list }

            {/*<h3 style={{*/}
            {/*    color: '#003659',*/}
            {/*    marginBottom: '5px',*/}
            {/*    marginTop: '30px',*/}
            {/*    textTransform: "uppercase",*/}
            {/*    fontFamily: 'Roboto Condensed',*/}
            {/*    fontSize: '20px',*/}
            {/*    fontWeight: '900',*/}
            {/*    letterSpacing: '-.2px'*/}
            {/*}}>*/}
            {/*    0. Ingrese código de usuario*/}
            {/*</h3>*/}
            {/*<Input value={code} onChange={changeCode} />*/}
            {/*<h3 style={{*/}
            {/*    color: '#252626',*/}
            {/*    marginBottom: '5px',*/}
            {/*    fontFamily: 'Roboto Condensed',*/}
            {/*    fontSize: '21px',*/}
            {/*    fontWeight: '500',*/}
            {/*    letterSpacing: '-.2px',*/}
            {/*    marginTop: '10px'*/}
            {/*}}>*/}
            {/*    {user.name}*/}
            {/*</h3>*/}
            {/*<h3 style={{*/}
            {/*    color: '#023581',*/}
            {/*    marginBottom: '5px',*/}
            {/*    fontFamily: 'Roboto Condensed',*/}
            {/*    fontSize: '16px',*/}
            {/*    fontWeight: '500',*/}
            {/*    letterSpacing: '-.2px',*/}
            {/*    marginTop: '-10px'*/}
            {/*}}>*/}
            {/*    {user.email}*/}
            {/*</h3>*/}
            {
            user.name &&
                <>
                        <h3 style={{
                            color: '#003659',
                            marginBottom: '5px',
                            marginTop: '30px',
                            textTransform: "uppercase",
                            fontFamily: 'Roboto Condensed',
                            fontSize: '20px',
                            fontWeight: '900',
                            letterSpacing: '-.2px'
                        }}>
                        1. Seleccione una fecha libre en el calendario
                        </h3>
                        <Calendar
                            //tileDisabled={({activeStartDate, date, view }) => date.getDay() === 0}
                            //tileDisabled={({activeStartDate, date, view }) => {tile(date); return false}}
                            tileDisabled={({activeStartDate, date, view}) => {
                                return tile(date)
                            }}
                            //tileContent={({ activeStartDate, date, view }) => view === 'month' && date.getDay() === 0 ? <p>It's Sunday!</p> : null}
                            //minDetail="month"
                            //activeStartDate={addDays(new Date(), 1)}
                            minDate={addDays(new Date(), 0)}
                            maxDate={addDays(new Date(), 90)}
                            locale="es-PE"
                            onClickDay={clickDay}
                        />
                        <h3 style={{
                            color: '#003659',
                            marginBottom: '5px',
                            marginTop: '30px',
                            textTransform: "uppercase",
                            fontFamily: 'Roboto Condensed',
                            fontSize: '20px',
                            fontWeight: '900',
                            letterSpacing: '-.2px'
                        }}>
                        2. Describa la razón de su cita
                        </h3>
                        <Form>
                        <Form.Item

                            rules={[{ required: true, message: 'Please input your username!' }]}
    >                   /
                        <TextArea value={comment} onChange={changeComment} />
                            <h3 style={{
                            color: '#003659',
                            marginBottom: '5px',
                            marginTop: '30px',
                            textTransform: "uppercase",
                            fontFamily: 'Roboto Condensed',
                            fontSize: '20px',
                            fontWeight: '900',
                            letterSpacing: '-.2px'
                             }}>
                            3. Seleccione un horario libre de la lista
                            </h3>
                        </Form.Item>
                        </Form>
                    </>
            }
            {user.name && data && <Schedule items={data["Piura"].fechas[currentDay]} day={currentDay} onChangeData={changeData}/> }
            <Modal open={isModalOpen} onOk={handleOk} >
                Usuario {user.name}, Ud. ya tiene una cita
            </Modal>
            <Modal open={isConfirmOpen} onOk={handleConfirmOk} >
                Usuario {user.name}, su cita ha sido programada!
            </Modal>
        </div>
    )
}

export default Component
