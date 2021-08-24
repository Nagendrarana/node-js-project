//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("item",itemSchema);
const item1 =new Item({
  name:"task1"
});


const item2 =new Item({
  name:"task2"
});


const item3 =new Item({
  name:"task3"
});

const defaultItems  = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
    Item.find({},function(err,foundItems){
      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Success")
          }
        });
        res.redirect("/");
      }

      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

    });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({

    name:itemName
  });
  if(listName==="Today"){


  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: listName},function(err,result){
    result.items.push(item);
    result.save();
    res.redirect("/" + listName);
  });

}

});

app.post("/delete",function(req,res){

  const item_id=req.body.checkbox;
  const list = req.body.listName;
  if (list==="Today"){
    Item.findByIdAndRemove(item_id,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully deletes task :" + req.body.checkbox);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: list},{$pull: {items: {_id: item_id}}},function(err,result){
      if(!err){
        res.redirect("/"+list);
      }
    });
  }


});

app.get("/:listName", function(req,res){

  const customListName = _capitalize(req.params.listName);
  console.log(customListName);
  List.findOne({name :customListName},function(err,results){
    if(!err){
      if(!results){
        //create new list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show existing list
        res.render("list",{listTitle: results.name, newListItems: results.items});
      }
    }

  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
