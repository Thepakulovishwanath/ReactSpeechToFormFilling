import React from 'react'
import "./index.css"
import Singnup from './LoginSignups/Singnup'
import { BrowserRouter,Routes, Route } from 'react-router-dom'
import Login from './LoginSignups/Login'
import Home from './LoginSignups/Home'
import SpToTx from './LoginSignups/SpToTx'
 

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Singnup/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/home' element={<Home/>} />
        <Route path='/SpToTx' element={<SpToTx/>} />

      </Routes>
    </BrowserRouter>
  )
}
 
export default App