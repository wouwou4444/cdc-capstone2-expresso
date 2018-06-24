const express = require('express');

const menuitemRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuitemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = "SELECT * FROM MenuItem WHERE  MenuItem.id=$nid";
    const values = { $nid: menuItemId };

    console.log('MenuItem.id: ' + menuItemId + ", " + req.params.menuId)
    db.get(sql, values, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            req.menuItem = menuItem;
            console.log('menuItem.id: ' + req.menuItem.id + ", " + req.menuItem.menu_id)
            next();
        } else {
            console.log("No time sheet found");
            res.status(404).send();
        }
    })

});


menuitemRouter.get('/', (req, res, next) => {
    const values = {
        $neid: req.params.menuId
    };
    console.log("menuId: " + req.params.menuId);
    const sql = "SELECT * FROM MenuItem WHERE MenuItem.menu_id = $neid";
    db.all(sql, values, (err, menuitems) => {
        if (err) {
            console.log('err: ' + err);
            next(err);
        } else if (menuitems.length > 0) {
            console.log("menuitems: " + menuitems);
            res.status(200).json({ menuItems: menuitems });
        } else {
            console.log('empty array');
            res.status(200).send({ menuItems: []});
        }
    });
});



////
menuitemRouter.post('/', (req, res, next) => {
    for (prop in req.body.menuItem) {
        console.log('req.body: ' + prop + ', ' + req.body.menuItem[prop]);
    }
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
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
                            res.status(201).json({ menuItem: menuitem });
                        }
                    })
            }
        });
});

menuitemRouter.put('/:menuItemId', (req, res, next) => {
    for (prop in req.body.menuItem) {
        console.log('req.body: ' + prop + ', ' + req.body.menuItem[prop]);
    }
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        id = req.params.menuItemId;
    if (!name || !description || !inventory || !price) {
        console.log('name: ' + name + ', description: ' + description);
        res.status(400).send();
    }
    console.log('name: ' + name + ', description: ' + description);
    db.run('UPDATE  MenuItem SET \
            name = $nname, \
            description = $ndescription, \
            inventory = $ninventory, \
            price = $nprice \
            WHERE MenuItem.id = $nid',
        {
            $nname: name,
            $ndescription: description,
            $ninventory: inventory,
            $nprice: price,
            $nid: id
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM MenuItem WHERE MenuItem.id = $nid", { $nid: id },
                    (err, menuitem) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("menuitem: " + menuitem);
                            res.status(200).json({ menuItem: menuitem });
                        }
                    })
            }
        });
});


menuitemRouter.delete('/:menuItemId', (req, res, next) => {
    console.log('MenuItem');
    const sql = "DELETE FROM MenuItem WHERE MenuItem.id = $nid";
    console.log('SQL: ' + sql);
    const values = { $nid: req.params.menuItemId };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = menuitemRouter;