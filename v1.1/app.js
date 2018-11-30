var express = require("express");
var mysql = require("mysql")
var app = express();
var bodyParser = require("body-parser");
var child_process = require("child_process");
var fileUpload = require("express-fileupload");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Port **********************************************
app.listen(3000, function() {
    console.log("The mysqlApp Server has started on 3000");
});

// mysql Connection *****************************
var connection = mysql.createConnection({
    host: "localhost",
    user: "luke",
    password: "yuchen",
    database: "newarkdata"
});
connection.connect(function(error) {
    if (error) throw error;
    console.log("connection newarkdata Connected!");
});

var connection2 = mysql.createConnection({
    host: "localhost",
    user: "luke",
    password: "yuchen",
    database: "data_description"
});
connection2.connect(function(error) {
    if (error) throw error;
    console.log("connection data_description Connected!");
});



// Home landing page ****************************
app.use(express.static('views'));
app.use(express.static('public'));
app.set("view engine", "ejs");
app.get("/", function(req, res) {
    connection.query("SHOW TABLES", function(err, rows, fields) {
        if (err) throw err;
        else
            res.render("landing", { rows: rows });
    });
});
// Add Description************************************

app.get("/add", function(req, res) {
    res.render("add-description");
});

app.post("/add", function(req, res) {
    var query = "INSERT INTO `description` (dataset, description) VALUES (";
    query += " '" + req.body.dataset + "',";
    query += " '" + req.body.description + "')";

    connection2.query(query, function(err, result) {
        res.redirect("http://localhost:3000/#");
    })
});
// Applications****************************************
// Only available in Windows because of the execution of a bat file
// Also note that the web page changed to port 3000
app.get("/app", function(req, res) {
    connection2.query("SELECT * FROM apps", function(err, rows, fields) {
        if (err) throw err;
        else
            res.render("applications", { rows: rows });
    })
});
app.post("/app", function(req, res) {
   var appName = req.body.app; 
   var app = 'cmd /c ' + appName;
   child_process.exec('/external/' + app, function(err, stdout, stderr) {
       if (err) {
            return console.log(err);
        }
        console.log(stdout);
   });
});

// Add Application*************************************
app.get("/app/add-application", function(req, res) {
    res.render("add-application");
})

app.post("/app/add-application", function(req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded');
    }
    let sampleFile = req.files.sampleFile;
    let fileName = sampleFile.name;
    sampleFile.mv('/dataviz/v1.1/views/external/' + fileName, function(err) {
        if (err)
            return res.status(500).send(err);
        
        var query = "INSERT INTO `apps` (application) VALUES (";
        query += " '" + fileName + "')";
        connection2.query(query, function(err, result) {
            res.redirect("http://njit.localtunnel.me:3000/app");
        })
    })
})

// Delete Application*************************************
app.get("/app/delete-application", function(req, res) {
    res.render("delete-application");
})

app.post("/app/delete-application", function(req, res) {
    var query = "DELETE FROM `apps` WHERE `application` =";
    query += " '" + req.body.application + "'";

    connection2.query(query, function(err, result) {
        res.redirect("http://njit.localtunnel.me:3000/app/");
    })
})

// Insert Rows*****************************************
app.get("/insert-rows", function(req, res) {
    res.render("insert-rows");
});
app.post("/insert-rows", function(req, res) {
    child_process.exec('cmd /c InsertRows.bat', function(err, stdout, stderr) {
       if (err) {
            return console.log(err);
        }
        console.log(stdout);
   });
})


// Data Loading ***************************************
app.get("/:Tables_in_newarkdata", function(req, res) {
    var tableName = req.params.Tables_in_newarkdata;
    connection.query("SELECT * FROM " + tableName + " LIMIT 20", function(err, rows, fields) {
        res.render("dataPage", {rows, fields, tableName});
    });
});

// See Description ************************************
app.get("/:Tables_in_newarkdata/see-description", function(req, res) {
    var tableName = req.params.Tables_in_newarkdata;
    connection2.query("SELECT * FROM `description` WHERE dataset = " + "'" + tableName + "'", function(err, rows, fields) {
        res.render("see-description", {rows, fields, tableName});
    });
});
// Edit Description ************************************
app.get("/:Tables_in_newarkdata/see-description/edit-description", function(req, res) {
    var tableName = req.params.Tables_in_newarkdata;
    res.render("edit-description", { tableName });
});
app.post("/:Tables_in_newarkdata/see-description/edit-description", function(req, res) {
    var tableName = req.body.dataset;
    var query = "DELETE FROM description WHERE dataset = '" + tableName + "'";
    connection2.query(query);

    var query1 = "INSERT INTO `description` (dataset, description) VALUES (";
    query1 += " '" + req.body.dataset + "',";
    query1 += " '" + req.body.description + "')";

    connection2.query(query1, function(err, result) {
        res.redirect("http://localhost:3000/" + tableName + "/see-description");
    });
});

// Drop table*******************************************
app.get("/:Tables_in_newarkdata/drop", function(req, res) {
    var tableName = req.params.Tables_in_newarkdata;
    connection.query("Drop table `" + tableName + "`", function(err, rows, fields) {
        res.redirect("http://localhost:3000/#s");
    });
});


// Visualize *******************************************
app.use('/abandoned_properties', express.static('public'));
app.use('/newark_housing', express.static('public'));
app.get("/:Tables_in_newarkdata/:graph", function(req, res) {
    var tableName = req.param.Tables_in_newarkdata;
    if (tableName == "abandoned_properties") {
        res.sendFile("abandoned_properties.html");
    }
    else if (tableName == "newark_housing") {
        res.sendFile("newark_housing.html");
    }
    else {
        res.send("Wrong");
    }
});
