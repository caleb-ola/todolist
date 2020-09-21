//jshint : esversion6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-caleb:test123@cluster0.l6npf.mongodb.net/todolistDB",  {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
 name: "Wecome to you to do list app"
});

const item2 = new Item({
    name: "click the + button to add a new item"
});

const item3 = new Item({
    name: "Have fun planning your day"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const options = {
            weekday : "long",
            year : "numeric",
            month : "short",
            day : "numeric"   
     }
    const today = new Date();
    const TDLdate = today.toLocaleDateString("en-US",options);  


const List = mongoose.model("list", listSchema);

app.get("/", (req,res) => {

    

    Item.find({}, (err, data) => {

        if(data.length === 0){
            Item.insertMany(defaultItems,(err) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                       // console.log("updated successfully");
                       
                    }
                });
                res.redirect("/");
        }
        else{
           res.render("lister", {latest : data, TDdate : TDLdate }); 
        }       
    });   
});

// app.get("/focus", (req,res) => {
//     res.render("lister", {TDdate : "FOCUS" , latest : focuss});
// }); 



app.post("/", (req,res) => {
    const list = req.body.newList;

    const itemz = new Item ({
        name: list
    });
        //data.push(itemz);  
        // Item.find({}, (err,data) =>{
        //     if(err){
        //         console.log(err);
        //     }
        //     else{
        //         data.push(itemz);
        //         console.log(data);
                                
        //     }              
        // }); 
        if(req.body.submit === TDLdate){
             itemz.save();
        res.redirect("/");
    } 
    else{
        List.findOne({name: req.body.submit}, (err, foundList) => {
            foundList.items.push(itemz);
            foundList.save();
            res.redirect("/"+req.body.submit);
            
        })
      }     
});

app.post("/delete", (req,res) => {
    const sem = req.body.summi;
    const lastD = req.body.lastDel;
    //console.log({sem});
    if(lastD === TDLdate){
         Item.findByIdAndDelete(sem, (err) => {
        if(err) {
            console.log(err)
        }
    });
    res.redirect("/");
    }else{
        List.findOneAndUpdate({name: lastD},{$pull: {items : {_id:sem}}}, (err, foundList) => {
            if(!err){
                res.redirect("/"+lastD);
            }
        });
    }
   
});

app.get("/:newList",(req,res) => {
    const adder = _.capitalize(req.params.newList);

    List.findOne({name:adder}, (err,foundList) => {
       if(!err){
           if(!foundList){
               //console.log("DOESNT EXIST!"); 
               //Not found in the database
               const iitem = new List({
                name: adder,
                items: defaultItems
            });
            iitem.save();
            res.redirect("/"+adder);
           }
           else{
            res.render("lister", {latest : foundList.items, TDdate : foundList.name });
           }
       }
    });
    
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
    console.log("Listening @ port 3000");
})