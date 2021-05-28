const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sudheer:Test123@cluster0.2mtmy.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);
const brush = new Item({
  name: "Brush"
});
const bath = new Item({
  name: "Bath"
});
const eat = new Item({
  name: "Eat"
});

const defaultItems = [brush, bath, eat];
const listSchema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // let day = date.getDate();
  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function(err, items) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added");
        }
      });
      res.render("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newitemlist: founditems
      });
    }
  })
})
app.get("/:customList", function(req, res) {
  const customListName = _.capitalize(req.params.customList);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newitemlist: foundList.items
        })
      }
    }
  })

})
app.post("/", function(req, res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newitemlist: workitems
//   });
// })
app.post("/delete", function(req, res) {
  const listName = req.body.listName;
  const deleted = req.body.checkbox;
  if (listName === "Today") {
    Item.findByIdAndRemove(deleted, function(err) {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: deleted
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }


});
let port = process.env.PORT;
if(port==null || port == "")
{
  port = 3000;
}
app.listen(port, function() {
  console.log("server has started successfully")
})
