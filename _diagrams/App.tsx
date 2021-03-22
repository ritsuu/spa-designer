import css from './App.less';

import React, {useMemo} from 'react';
import {message} from 'antd';
import Designer from '@mybricks/spa-designer';
import {useComputed, useObservable} from '@mybricks/rxui';

import designerCfg from './config'

import {getLocationSearch} from "./utils";
import {LS_DEFAULT_KEY, LS_VB_PRE} from "./constants";

export default function App() {
  //定义响应式对象，用于保存设计器onload返回的内容
  const loaded = useObservable(class {
    handlers//按钮
    dump//保存时获取当前设计内容的函数
  })

  useMemo(() => {
    //合并快捷键到配置对象中
    Object.assign(designerCfg, {
      keymaps() {
        return {
          get ['ctrl+s']() {//保存
            return () => {
              save(loaded)
            }
          }
        }
      }
    })
  }, [])

  return (
    <div className={css.mainView}>
      {/*工具条*/}
      <TitleBar loaded={loaded}/>
      {/*设计器*/}
      <Designer config={designerCfg}
                onLoad={({handlers, dump}) => {
                  //赋值到响应式对象
                  loaded.handlers = handlers
                  loaded.dump = dump
                }}
                onMessage={(type, msg) => {
                  //对设计过程中产生的消息进行处理
                  message.destroy()
                  message[type](msg)
                }}/>
    </div>
  )
}

function TitleBar({loaded}) {
  //处理onLoad中返回的handlers
  const [middleBtns, rightBtns] = useComputed(() => {
    const middleBtns = [], rightBtns = []

    if (loaded.handlers) {
      const hary = loaded.handlers
      if (hary) {
        hary.forEach(hd => {
          switch(hd.id){
            case 'toggleNavView':{
              middleBtns.push(jsxHandler(hd))
              break
            }
            case 'toggleCfgView':{
              middleBtns.push(jsxHandler(hd,{marginLeft: 'auto'}))
              break
            }
            case 'toggleDebug':{
              rightBtns.push(jsxHandler(hd,{
                backgroundColor: '#FF0000',
                color:'#FFF',
                border:'0px'
              }))
              break
            }
          }
        })
      }
    }

    return [middleBtns, rightBtns]
  })

  return (
    <div className={css.titleBar}>
      <div className={css.logo}>
        My<i>Bricks</i> <span>通用0代码解决方案</span>
      </div>
      <div className={css.btnsLeft}>
      </div>
      <div className={css.btnsHandlers}>
        {middleBtns}
      </div>
      <div className={css.btnsRight}>
        {rightBtns}
        <button onClick={() => save(loaded)}>保存</button>
        {/*<button onClick={publish}>发布</button>*/}
      </div>
    </div>
  )
}

function jsxHandler(handler,style?) {
  const title = handler.title
  style = Object.assign({opacity: handler.disabled ? 0.2 : 1},style || {})
  return (
    <button disabled={handler.disabled} key={handler.id} onClick={handler.exe}
            style={style}>{title}</button>
  )
}

function save(loaded) {
  const dumpContent = loaded.dump()

  const searchParam = getLocationSearch()
  localStorage.setItem(`${LS_VB_PRE}${searchParam.length ? getLocationSearch() : LS_DEFAULT_KEY}`, JSON.stringify(dumpContent));
  message.info('保存完成.')
}