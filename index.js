require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Phonebook = require('./models/phonebook')


const app = express()
morgan.token('body', (req,res) => req.method!=='GET' ? JSON.stringify(req.body) : " ")



app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))

app.get('/', (req,res) => {
  res.send(`<div><h1>Hello World!</h1></div>`)
})
app.get('/api/persons', (req,res) => {
  Phonebook.find({})
    .then(persons =>{
      res.json(persons.map(person => person.toJSON()))
    })
})

app.get('/info', (req,res) => {
  Phonebook.count({})
    .then(result => {
      res.send(`<div><p>Phonebook has info for ${result}</p> <p>${new Date()}</p></div>`)
    })
})

app.get('/api/persons/:id',(req,res,next) => {
  Phonebook.findById(req.params.id)
    .then(person =>{
      res.json(person.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req,res,next) => {
  Phonebook.findByIdAndRemove(req.params.id)
    .then(result =>{
      res.status(204).end()
    })
    .catch(error => next(erro))
})

app.put('/api/persons/:id', (req,res,next) =>{
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }
  Phonebook.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))

})


app.post('/api/persons',(req,res,next) => {
  const body = req.body

  if(!body.name){
    return res.status(400).send({error: 'name missing'})

  }
  else if(!body.number){
    return res.status(400).send({error: 'number missing'})
  }
  else{
    const person = new Phonebook({
      name: body.name,
      number: body.number,
    })
    person.save()
      .then(savedPerson => {
        res.json(savedPerson.toJSON())
      })
      .catch(error => next(error))
  }  
})

const errorHandler = (error, req, res, next) =>{
  //console.log(error.message)
  if(error.name==='CastError' && error.kind==='ObjectId'){
    return res.status(400).send({error: 'malformatted id'})
  }else if(error.name==='ValidationError'){
    return res.status(400).send({error: error.message})
  }
  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
})