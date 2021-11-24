//import dependecies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import Pusher from 'pusher'
import mongoMessages from './messagemodel.js'
//app config
const app = express()
const port =process.env.PORT || 5000
const pusher = new Pusher({
    appId: "1302942",
    key: "827f950e82b87ac4ae87",
    secret: "b4b6e094ec97b2ee2470",
    cluster: "ap2",
    useTLS: true
  });

//middlewares
app.use(express.json())
app.use(cors())

//db config
const mongoURI='mongodb+srv://admin:admin@cluster0.gaoar.mongodb.net/messeger?retryWrites=true&w=majority';
mongoose.connect(mongoURI,{
    // useCreateIndex: true,
    useNewUrlParser: true,
    useunifiedTopology: true
});



mongoose.connection.once('open',()=>{
    console.log("DB connected")
    const changeStream =  mongoose.connection.collection('messages').watch()
    changeStream.on('change',(change)=>{
        pusher.trigger('messages','newMessage',{
            'change': change
        })
    })
})
//api routes
app.get('/',(req,res)=>res.status(200).send("hello world"))
app.post('/save/messages',(req,res)=>{
    const dbMessage = req.body
    mongoMessages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else {
            res.status(201).send(data)
        }
    })
})
app.get('/retrieve/conversation',(req,res)=>{
    mongoMessages.find((err,data)=> {
        if(err){
            res.status(500).send(err)
        }
        else {
            data.sort((b,a)=>{
                return a.timestamp - b.timestamp;
            })
            res.status(200).send(data)
        }
    })
})
//listeners
app.listen(port,()=>console.log(`listening on localhost:${port}`))