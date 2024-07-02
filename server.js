const express = require("express")
const app = express()
const mysql = require("mysql")
const connection = require("./db.js")
const cookieParser = require("cookie-parser")
const sendToken = require("./sendToken.js")

const PORT = 8000
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to db")
});

const createUserTable = "CREATE TABLE IF NOT EXISTS users (name VARCHAR(255), password VARCHAR(255) NOT NULL,email VARCHAR(50) PRIMARY KEY NOT NULL)"

connection.query(createUserTable, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  })

//Creating user --Customer
app.post("/api/v1/user/register",(req,res,next)=>{
    const {name,password,email} = req.body
    const createUser = `INSERT INTO users (name,password,email) VALUES ('${name}', '${password}','${email}')`;
    connection.query(createUser,(err)=>{
        if (err){
            console.log(err)
            res.status(400).json({
                success:false,
                message:"Failed to register"
            })
            return
        }
        res.status(200).json({
            success:true,
            message:"User created successfully"
        })
    })
})


//Login user --Customer
app.post("/api/v1/user/login",(req,res)=>{
    const {email,password} = req.body
    const getUser = `SELECT * FROM users WHERE email='${email}'`
    connection.query(getUser,(err,result)=>{
        if(err){
            console.log(err)
            res.status(400).json({
                success:false,
                message:"Failed to login"
            })
            return
        }
        if(result.length===0 || result[0].password!==password){
            res.status(401).json({
                success:false,
                message:"Incorrect username/password provided. Please retry"
            })
            return
        }
        sendToken(res,result[0])
    })
})

//Adding a car for rental --Admin
//API key = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
app.post("/api/v1/car/create",(req,res,next)=>{
    const {key} = req.query
    if(key!==API_KEY){
        res.status(401).json({
            success:false,
            message:"Invalid API KEY"
        })
        return
    }
    const {car_id,category,model,number_plate,current_city,rent_per_hr,history} = req.body
    const addCar = `INSERT INTO cars(category,model,number_plate,current_city,rent_per_hr) 
                    VALUES ('${category}','${model}','${number_plate}','${current_city}','${rent_per_hr}')`
    connection.query(addCar,(err)=>{
        if(err){
            console.log(err)
            res.status(401)
            return;
        }
        res.status(200).json({
            success:true,
            car_id,
            message: "Car added successfully"
        })
    })
})  

//Get available car --customer
app.get("/api/v1/car/get-rides",(req,res)=>{
    const {origin,dest,cat,rh} = req.query
    const getCars = `SELECT * FROM cars WHERE status=1 AND current_city='${origin}' AND category='${cat}'`
    connection.query(getCars,(err,result)=>{
        if(err){
            console.log(err)
            return
        }
        for(let i=0;i<result.length;i++){
            result[i].total_payable_amt = result[i].rent_per_hr*rh
        }
        res.status(200).json(result)
    })
})

//Rent car --customer

const createCarTable = `CREATE TABLE IF NOT EXISTS cars(car_id INT UNIQUE,category VARCHAR(10), 
                        model VARCHAR(20), number_plate VARCHAR(10) PRIMARY KEY NOT NULL, 
                        current_city VARCHAR(15), rent_per_hr INT, status INT DEFAULT 1)`

const createCarHistoryTable = `CREATE TABLE IF NOT EXISTS history(origin VARCHAR(20), 
                                destination VARCHAR(20), amount INT, car VARCHAR(10) NOT NULL,
                                FOREIGN KEY (car) REFERENCES cars(number_plate))`

app.listen(PORT,()=>{
    connection.query(createCarTable,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Car table created")
        }

    })
    connection.query(createCarHistoryTable,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("History table created")
        }

    })
    console.log("Server running")
})


