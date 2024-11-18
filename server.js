const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const port =3077;
const app=express();
app.use(express.static(__dirname))
app.use(express.urlencoded({extended:true}))

mongoose.connect("Your MongoDb connecting link", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db= mongoose.connection
db.once('open',()=>{
    console.log("Mongo connected");
})

const userSchema = new mongoose.Schema({
    emp_id:{type: Number,unique: true,required: true},
    name: { type: String, unique: true, required: true },
    designation: { type: String,  required: true },
    dob: { type: Date,  required: true },
    gender: { type: String,  required: true },
    address: { type: String, unique: true, required: true },
    contact: { type: String, unique: true, required: true },
    bas_sal: { type: Number,  required: true },
    gross_pay: { type: Number,  required: true },
    deduction: { type: String, required: true },
    net_salary: { type: Number, required: true }
   
})
const Users= mongoose.model("emp_form",userSchema)

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'login.html'))
})
app.post('/post',async(req,res)=>{
    const{emp_id,name,designation,dob,gender,address,contact,bas_sal,gross_pay,deduction,net_salary}=req.body
const user = new Users({
    emp_id,
    name,
    designation,
    dob,
    gender,
    address,
    contact,
    bas_sal,
    gross_pay,
    deduction,
    net_salary
})
await user.save()
console.log(user)
res.send("Submision sucessful")
})
app.delete('/delete/:emp_id', async (req, res) => {
    try {
        const empId = req.params.emp_id;
        const result = await Users.deleteOne({ emp_id: empId });

        if (result.deletedCount > 0) {
            res.send(`Employee with emp_id ${empId} deleted successfully.`);
        } else {
            res.status(404).send(`Employee with emp_id ${empId} not found.`);
        }
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).send("Error deleting employee.");
    }
});

app.get('/processPayroll', async (req, res) => {
    try {
        
        const employees = await Users.find();

       
        const payrollUpdates = employees.map(async (employee) => {
            const { bas_sal, gross_pay, deduction } = employee;
            
           
            const net_salary = gross_pay - parseFloat(deduction);
            
            
            await Users.updateOne({ emp_id: employee.emp_id }, { net_salary });
            return { emp_id: employee.emp_id, net_salary };
        });

        const updatedPayroll = await Promise.all(payrollUpdates);

        res.json({
            message: "Payroll processed successfully",
            updatedPayroll
        });
    } catch (error) {
        console.error("Error processing payroll:", error);
        res.status(500).json({ error: "Failed to process payroll" });
    }
});


app.listen(port,()=>
{
    console.log("Server started")
}) 
//const uri = 'mongodb+srv://younustheman:younus.ms123@cluster0.xon7a.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';
//mongoose.connect("mongodb://localhost:27017/stockMaintenanceApp", {
   // useNewUrlParser: true,
  //  useUnifiedTopology: true,
//})