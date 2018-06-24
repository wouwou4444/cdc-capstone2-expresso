const express = require('express');

const menuitemRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



menuitemRouter.get('/', (req, res, next) => {
    const values = {
        $neid: req.params.menuId
    };
    const sql = "SELECT * FROM MenuItem WHERE MenuItem.menu_id = $neid";
    db.all(sql, values, (err, menuitems) => {
        if (err) {
            next(err);
        }
        res.status(200).json({ menuitems: menuitems })
    });
});



////
menuitemRouter.post('/', (req, res, next) => {
    for (prop in req.body.menuitem) {
        console.log('req.body: ' + prop + ', ' + req.body.menuitem[prop]);
    }
    const name = req.body.menuitem.name,
        description = req.body.menuitem.description,
        inventory = req.body.menuitem.inventory,
        price = req.body.menuitem.price,
        menu_id = req.params.menuId;
    if (!name || !description || !inventory || !price) {
        console.log('name: ' + name + ', description: ' + description);
        res.status(400).send();
    }
    console.log('name: ' + name + ', description: ' + description);
    db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) \
            VALUES ($nname, $ndescription, $ninventory, $nprice, $nmenu_id)',
        {
            $nname: name,
            $ndescription: description,
            $ninventory: inventory,
            $nprice: price,
            $nmenu_id: menu_id
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM MenuItem WHERE MenuItem.id = $nid", { $nid: this.lastID },
                    (err, menuitem) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("menuitem: " + menuitem);
                            res.status(201).json({ menuitem: menuitem });
                        }
                    })
            }
        });
});


module.exports = menuitemRouter;