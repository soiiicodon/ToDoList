//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://soicodon:vandat999%40@cluster0.u9ieb7n.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = {
  name: String
}
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItem = [item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', ListSchema);

app.get("/", function(req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect('/');
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save(); 
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);      
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const checkListName = req.body.listName;
  if (checkListName == "Today") {
    Item.findByIdAndRemove(checkItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      } 
    })  
  } else {
    List.findOne({name: checkListName}, function (err, foundList) {
      foundList.items.pull(checkItemId);
      foundList.save();
      res.redirect("/" + checkListName);
    })
  }
})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItem
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list",  {listTitle: foundList.name, newListItems: foundList.items})
      }
    } 
  })
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
