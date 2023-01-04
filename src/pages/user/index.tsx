import {useState} from 'react'
import styles from './index.module.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {addDays, addMinutes, format} from 'date-fns'
import oData from './data.json'
import 'antd/dist/reset.css';
import {Typography, Table, Tag, Col, Row, Input, Modal} from "antd";

const Schedule = (props: any) => {
    const cellClick = (e: any) => {
        console.log('cellClick')
        console.log(e)
        props.onChangeData(e)
    }

    console.log('yyy')

    let today = format(new Date, 'yyyy-MM-dd')
    let now = format(addMinutes(new Date, 45),  'HH:mm')
    console.log(today)
    console.log(props.day)

    let cdata = []
    for (let i = 0; i < props?.items?.length; i++) {
        //columns.push({title: props.items[i].hInicio + " - " + props.items[i].hFin, index: "estado"}
        let element


        if (props.day == today && props.items[i].hInicio <= now) {
            console.log("I:" + props.items[i].hInicio)
            console.log("N:" + now)
            props.items[i].estado = 'Ocupado'
        }

        switch (props.items[i].estado) {
            case 'libre':
                element =
                    <Col span={6} >
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
                    <Col span={6}>
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


    // return (
    //     <div style={{marginBottom: "20px", marginTop: "20px", fontFamily: "Arial, Helvetica"}}>
    //         <Table bordered columns={columns} dataSource={cdata} size="small"
    //         />
    //     </div>
    // )

    return (
        <Row gutter={16} className={styles.grid}>
            {cdata}
        </Row>
    )
}

function Component() {
    const [currentDay, setCurrentDay] = useState(format(new Date, 'yyyy-MM-dd'))
    const [data, setData] = useState(oData);
    const [code, setCode] = useState(202001)
    const [isModalOpen, setIsModalOpen] = useState(false)


    const handleOk = () => {
        setIsModalOpen(false)
    }
    const changeData = (e: any) => {
        console.log('xxx')
        console.log(e)
        let items = {...data};

        let c = 0
        for (const fecha in items["Piura"].fechas) {
            console.log(fecha)
            let list = items["Piura"].fechas[fecha].filter((it: any) => { return it.usuario == code});
            console.log('list')
            console.log(list)
            c = c + list.length
        }
        console.log('C: ' + c);
        if (c) {
            setIsModalOpen(true)
            return
        }

        // @ts-ignore
        let l = (items["Piura"].fechas[currentDay].length)
        // @ts-ignore
        for (let i = 0; i < items["Piura"].fechas[currentDay].length; i++) {
            // @ts-ignore
            console.log(i)
            if (items["Piura"].fechas[currentDay][i]?.hInicio == e.substring(0, 5)) {
                // @ts-ignore
                items["Piura"].fechas[currentDay][i].estado = "Ocupado"
                // @ts-ignore
                items["Piura"].fechas[currentDay][i].usuario = code
                // @ts-ignore
                console.log(items["Piura"].fechas[currentDay][i].estado)
            }
        }

        setData(items)
    }
    const tile = (date: Date) => {
        let fdate = format(date, 'yyyy-MM-dd')

        // @ts-ignore
        if (data["Piura"].fechas[fdate]) {
            // @ts-ignore
            let _empty = data["Piura"].fechas[fdate].filter((d: any) => {
                return d.estado == "libre"
            })
            console.log(fdate)
            console.log(_empty.length != 0)
            return (_empty.length == 0)
        } else {
            return true
        }
    }

    const clickDay = (day: any) => {
        setCurrentDay(format(day, 'yyyy-MM-dd'))
    }

    // @ts-ignore

    const changeCode = (e: any) => {
        console.log(e)
        setCode(e.target.value)
    }

    return (
        <div className={styles.component}>
            <h2 style={{color: '#003659', marginBottom: '30px', marginTop: '20px', textTransform: "uppercase"}}>Gestión
                de Citas</h2>
            <h3 style={{color: '#003659', marginBottom: '5px', marginTop: '30px', textTransform: "uppercase"}}>
                0. Ingrese código de usuario
            </h3>
            <Input value={code} onChange={changeCode} />
            <h3 style={{color: '#003659', marginBottom: '5px', marginTop: '30px', textTransform: "uppercase"}}>
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
                maxDate={addDays(new Date(), 10)}
                locale="es-PE"
                onClickDay={clickDay}
            />
            <h3 style={{color: '#003659', marginBottom: '0px', marginTop: '30px', textTransform: "uppercase"}}>
                2. Seleccione un horario libre de la lista
            </h3>
            <Schedule items={data["Piura"].fechas[currentDay]} day={currentDay} onChangeData={changeData}/>
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} >
                Usuario {code}, Ud. ya tiene una cita
            </Modal>
        </div>
    )
}

export default Component
