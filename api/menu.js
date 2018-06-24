const express = require('express');

const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuitemRouter = require('./menuitem.js');

menuRouter.param('menuId', (req, res, next, menuId) => {
    id = menuId;
    db.get('SELECT * FROM Menu WHERE Menu.id = $nid',
        {
            $nid: id
        },
        (err, menu) => {
            if (err) {
                next("EmployeeRouter.param" + err)
            } else if (menu) {
                console.log('Menu: ' + menu);
                req.menu = menu;
                next();
            } else {
                console.log('Menu not found');
                res.status(404).send();
            }
        });
});


menuRouter.use('/:menuId/menu-items', menuitemRouter);


menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu',
        (err, menus) => {
            if (err) {
                next(err);
            } else {
                console.log("Employees: " + menus)
                res.status(200).json({ menus: menus });
            }
        });
});

//////////
menuRouter.post('/', (req, res, next) => {
    for (prop in req.body.menu) {
        console.log('req.body: ' + prop + ', ' + req.body.menu[prop]);
    }
    const title = req.body.menu.title;
    if (!title ) {
        console.log('title: ' + title);
        res.status(400).send();
    }
    console.log('title: ' + title);
    db.run('INSERT INTO Menu (title) \
            VALUES ($ntitle)',
        {
            $ntitle: title
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM Menu WHERE Menu.id = $nid", { $nid: this.lastID },
                    (err, menu) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("Employee title: " + menu.title);
                            res.status(201).json({ menu: menu });
                        }
                    })
            }
        });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).send({ menu: req.menu });
});

menuRouter.put('/:menuId', (req, res, next) => {
    for (prop in req.body.menu) {
        console.log('req.body: ' + prop + ', ' + req.body.menu[prop]);
    }
    const title = req.body.menu.title;
    if (!title) {
        console.log('title: ' + title);
        res.status(400).send();
    }
    console.log('title: ' + title);
    db.run('UPDATE  Menu SET title = $ntitle \
            WHERE Menu.id = $nid',
        {
            $ntitle: title,
            $nid: req.params.menuId
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM Menu WHERE Menu.id = $nid", { $nid: req.params.menuId},
                    (err, menu) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("Employee title: " + menu.title);
                            res.status(200).json({ menu: menu });
                        }
                    })
            }
        });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    console.log('Test');
    const sqlCheck = "SELECT * FROM MenuItem WHERE MenuItem.menu_id = $nid";
    console.log('sqlCheck: ' + sqlCheck);
    const valuesCheck = { $nid: req.params.menuId };
    db.all(sqlCheck, valuesCheck, (err, rows) => {

        if (err) {
            console.log("error in counting the number of MenuItem" +err);
            next(err);
        }
        console.log('rows: ' + rows);
        if (rows.length > 0) {
            res.status(400).send();
        } else {
            const sql = "DELETE FROM Menu WHERE Menu.id = $nid";
            console.log('SQL: ' + sql);
            const values = { $nid: req.params.menuId };

            db.run(sql, values, (err) => {
                console.log('Test1');
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            });

        }
    });
});

module.exports = menuRouter;