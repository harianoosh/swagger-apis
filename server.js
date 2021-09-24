const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const uuid = require("uuid4");

const mariadb = require("mariadb");
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "sample",
  port: 3306,
  connectionLimit: 5,
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const e = require("express");
const uuid4 = require("uuid4");
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Order and Company APIs",
      version: "1.0.0",
      description: "Swagger APIs generated by Anoosh Hariß",
    },
    host: `localhost:${port}`,
    basePath: "/",
  },
  apis: ["./server.js"],
};
const specs = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

const prices = {
  food: [
    {
      id: uuid().toString(),
      namme: "apple",
      price: 1,
    },
    {
      id: uuid().toString(),
      name: "orange",
      price: 2,
    },
    {
      id: uuid().toString(),
      name: "banana",
      price: 3,
    },
  ],
};

/**
 * @swagger
 * components:
 *      parameters:
 *         schemas:
 *             Company:
 *                 type: object
 *                 required:
 *                     -COMPANY_ID
 *                     -COMPANY_NAME
 *                     -COMPANY_CITY
 *                 properties:
 *                     COMPANY_NAME:
 *                         type: string
 *                         description: name of the company
 *                     COMPANY_CITY:
 *                         type: string
 *                         description: location of the company
 *                 example:
 *                     COMPANY_NAME: Apple
 *                     COMPANY_CITY: Charlotte
 *             Order:
 *                 type: object
 *                 required:
 *                     -ORD_NUM
 *                     -ORD_AMOUNT
 *                     -ADVANCE_AMOUNT
 *                     -ORD_DATE
 *                     -CUST_CODE
 *                     -AGENT_CODE
 *                     -ORD_DESCRIPTION
 *                 properties:
 *                     ORD_NUM:
 *                         type: integer
 *                         description: order number
 *                     ORD_AMOUNT:
 *                         type: integer
 *                         description: total order amount
 *                     ADVANCE_AMOUNT:
 *                         type: string
 *                         description: advance amount for order
 *                     ORD_DATE:
 *                         type: string
 *                         description: date of the order
 *                     CUST_CODE:
 *                         type: string
 *                         description: customer code
 *                     AGENT_CODE:
 *                         type: string
 *                         description: agent code who placed the order
 *                     ORD_DESCRIPTION:
 *                         type: string
 *                         description: description of the order or order details
 *                 example:
 *                     ORD_AMOUNT: 230
 *                     ADVANCE_AMOUNT: 150
 *                     ORD_DATE: 2008-01-08T00:00:00.000Z
 *                     CUST_CODE: C12315
 *                     AGENT_CODE: A123
 *                     ORD_DESCRIPTION: SOD
 *
 */

/**
 * @swagger
 * /companies:
 *      get:
 *          description: Return all companies
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: Successfully retrieved all the order details
 */
app.get("/companies", async (req, res) => {
  try {
    const result = await pool.query("select * from company");
    res.json(result);
  } catch (error) {
    res.send({ responseMessage: "Unknown error occured" });
  }
});

/**
 * @swagger
 * /company:
 *      post:
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Company'
 *          description: add a product tag into prices
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: prices of all the available objects
 *              400:
 *                  description: bad input criteria
 */
app.post("/company", async (req, res) => {
  try {
    console.log(req.body);
    let unique_id = new Date().getTime() + "";
    unique_id = new String(unique_id).substring(7);
    let company = {
      COMPANY_ID: unique_id,
      COMPANY_NAME: req.body.COMPANY_NAME,
      COMPANY_CITY: req.body.COMPANY_CITY,
    };
    const response = await pool.query(
      "INSERT INTO company(COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES (?, ?, ?)",
      [company.COMPANY_ID, company.COMPANY_NAME, company.COMPANY_CITY]
    );
    res.json(response);
  } catch (e) {
    res.status(400).send({ responseMessage: e.message });
  }
});

/**
 * @swagger
 * /company/{company_id}:
 *      put:
 *          description: updated an object using id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully updated the price
 *              400:
 *                  description: provided id unavailable
 *              500:
 *                  description: internal server error occured while performing the task
 *          parameters:
 *              - in: path
 *                name: company_id
 *                description: food item id that needs to be updated
 *                type: string
 *                required: true
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Company'
 */
app.put("/company/:company_id", async (req, res) => {
  console.log(req.body);
  try {
    let response = await pool.query(
      `UPDATE company SET COMPANY_NAME=\"${req.body.COMPANY_NAME}\", COMPANY_CITY=\"${req.body.COMPANY_CITY}\" WHERE COMPANY_ID=\"${req.params.company_id}\"`
    );

    let company = await pool.query(
      `SELECT * FROM company WHERE COMPANY_ID=${req.params.company_id}`
    );

    res.status(200).json({
      dbResponse: response,
      company: company.length != 0 ? company[0] : {},
    });
  } catch (error) {
    res.status(500).send({ responseMessage: error.message });
  }
});

/**
 * @swagger
 * /company/{company_id}:
 *      patch:
 *          description: updates the company object using id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully updated the company details
 *              400:
 *                  description: Id not found to update
 *              500:
 *                  description: internal server error occured
 *          parameters:
 *              - in: path
 *                name: company_id
 *                description: food item id that needs to be updated
 *                type: string
 *                required: true
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Company'
 */
app.patch("/company/:company_id", async (req, res) => {
  console.log(req.body);
  try {
    if (typeof req.body.COMPANY_CITY != "undefined") {
      await pool.query(
        `UPDATE company SET COMPANY_CITY=\"${req.body.COMPANY_CITY}\" WHERE COMPANY_ID=\"${req.params.company_id}\"`
      );
    }
    if (typeof req.body.COMPANY_NAME != "undefined") {
      await pool.query(
        `UPDATE company SET COMPANY_NAME=\"${req.body.COMPANY_NAME}\" WHERE COMPANY_ID=\"${req.params.company_id}`
      );
    }
    let updatedObject = await pool.query(
      `SELECT * FROM company WHERE COMPANY_ID=\"${req.params.company_id}\"`
    );
    if (updatedObject.length != 0) {
      res.status(200).json(updatedObject);
    } else {
      res
        .status(400)
        .send({ responseMessage: "No record found with given Id" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ responseMessage: error.message });
  }
});

/**
 * @swagger
 * /company/{company_id}:
 *      delete:
 *          description: remove the company object using compnay_id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully deleted the Company
 *              400:
 *                  description: Id not found to delete
 *              500:
 *                  description: internal server error occured
 *          parameters:
 *              - in: path
 *                name: company_id
 *                description: Company id that has to be deleted
 *                type: string
 *                required: true
 */
app.delete("/company/:company_id", async (req, res) => {
  try {
    if (typeof req.params.company_id != "undefined") {
      let response = await pool.query(
        `DELETE FROM company WHERE COMPANY_ID=\"${req.params.company_id}\"`
      );
      res.status(200).json(response);
    } else {
      res.status(400).send({ responseMessage: "Invalid input criteria" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ responseMessage: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *      get:
 *          description: Return all orders
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: Successfully retrieved all the order details
 */
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("select * from orders");
    res.json(result);
  } catch (error) {
    res.send({ responseMessage: "Unknown error occured" });
  }
});

/**
 * @swagger
 * /order:
 *      post:
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Order'
 *          description: add a product tag into prices
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: prices of all the available objects
 *              400:
 *                  description: bad input criteria
 */
app.post("/order", async (req, res) => {
  try {
    console.log(req.body);
    let unique_id = new Date().getTime() + "";
    unique_id = new String(unique_id).substring(7);
    let order = {
      ORD_NUM: parseInt(unique_id),
      ORD_AMOUNT: req.body.ORD_AMOUNT,
      ADVANCE_AMOUNT: req.body.ADVANCE_AMOUNT,
      ORD_DATE: req.body.ORD_DATE,
      CUST_CODE: req.body.CUST_CODE,
      AGENT_CODE: req.body.AGENT_CODE,
      ORD_DESCRIPTION: req.body.ORD_DESCRIPTION,
    };
    const response = await pool.query(
      "INSERT INTO orders(ORD_NUM, ORD_AMOUNT, ADVANCE_AMOUNT, ORD_DATE, CUST_CODE, AGENT_CODE, ORD_DESCRIPTION) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        order.ORD_NUM,
        typeof req.body.ORD_AMOUNT != "undefined" ? req.body.ORD_AMOUNT : 0,
        typeof req.body.ADVANCE_AMOUNT != "undefined"
          ? req.body.ADVANCE_AMOUNT
          : 0,
        typeof req.body.ORD_DATE != "undefined" ? req.body.ORD_DATE : "",
        typeof req.body.CUST_CODE != "undefined" ? req.body.CUST_CODE : "",
        typeof req.body.AGENT_CODE != "undefined" ? req.body.AGENT_CODE : "",
        typeof req.body.ORD_DESCRIPTION != "undefined"
          ? req.body.ORD_DESCRIPTION
          : "",
      ]
    );
    res.json(response);
  } catch (e) {
    res.status(500).send({ responseMessage: e.message });
  }
});

/**
 * @swagger
 * /order/{order_id}:
 *      put:
 *          description: updated an object using id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully updated the price
 *              400:
 *                  description: provided id unavailable
 *              500:
 *                  description: internal server error occured while performing the task
 *          parameters:
 *              - in: path
 *                name: order_id
 *                description: food item id that needs to be updated
 *                type: string
 *                required: true
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Order'
 */
app.put("/order/:order_id", async (req, res) => {
  console.log(req.body);
  try {
    let response = await pool.query(
      "UPDATE orders SET ORD_AMOUNT=?, ADVANCE_AMOUNT=?, ORD_DATE=?, CUST_CODE=?, AGENT_CODE=?, ORD_DESCRIPTION=? WHERE ORD_NUM=?",
      [
        typeof req.body.ORD_AMOUNT != "undefined" ? req.body.ORD_AMOUNT : 0,
        typeof req.body.ADVANCE_AMOUNT != "undefined"
          ? req.body.ADVANCE_AMOUNT
          : 0,
        typeof req.body.ORD_DATE != "undefined" ? req.body.ORD_DATE : "",
        typeof req.body.CUST_CODE != "undefined" ? req.body.CUST_CODE : "",
        typeof req.body.AGENT_CODE != "undefined" ? req.body.AGENT_CODE : "",
        typeof req.body.ORD_DESCRIPTION != "undefined"
          ? req.body.ORD_DESCRIPTION
          : "",
        req.params.order_id,
      ]
    );

    let company = await pool.query(
      `SELECT * FROM orders WHERE ORD_NUM=${req.params.order_id}`
    );

    if (company.length != 0) {
      res.status(200).json({
        dbResponse: response,
        company: company[0],
      });
    } else {
      res.status(400).send({ responseMessage: "provided id unavailable" });
    }
  } catch (error) {
    res.status(500).send({ responseMessage: error.message });
  }
});

/**
 * @swagger
 * /order/{order_id}:
 *      patch:
 *          description: updates the order object using id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully updated the order details
 *              400:
 *                  description: Id not found to update
 *              500:
 *                  description: internal server error occured
 *          parameters:
 *              - in: path
 *                name: order_id
 *                description: food item id that needs to be updated
 *                type: string
 *                required: true
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/parameters/schemas/Order'
 */
app.patch("/order/:order_id", async (req, res) => {
  console.log(req.body);
  try {
    if (typeof req.body.ADVANCE_AMOUNT != "undefined") {
      await pool.query(
        `UPDATE orders SET ADVANCE_AMOUNT=${req.body.ADVANCE_AMOUNT} WHERE ORD_NUM=${req.params.order_id}`
      );
    }

    if (typeof req.body.ORD_AMOUNT != "undefined") {
      await pool.query(
        `UPDATE orders SET ORD_AMOUNT=${req.body.ORD_AMOUNT} WHERE ORD_NUM=${req.params.order_id}`
      );
    }

    if (typeof req.body.ORD_DATE != "undefined") {
      await pool.query(
        `UPDATE orders SET ORD_DATE=\"${req.body.ORD_DATE}\" WHERE ORD_NUM=${req.params.order_id}`
      );
    }

    if (typeof req.body.CUST_CODE != "undefined") {
      await pool.query(
        `UPDATE orders SET CUST_CODE=\"${req.body.CUST_CODE}\" WHERE ORD_NUM=${req.params.order_id}`
      );
    }

    if (typeof req.body.AGENT_CODE != "undefined") {
      await pool.query(
        `UPDATE orders SET AGENT_CODE=\"${req.body.AGENT_CODE}\" WHERE ORD_NU${req.params.order_id}`
      );
    }

    if (typeof req.body.ORD_DESCRIPTION != "undefined") {
      await pool.query(
        `UPDATE orders SET ORD_DESCRIPTION=\"${req.body.ORD_DESCRIPTION}\" WHERE ORD_NU${req.params.order_id}`
      );
    }

    let updatedObject = await pool.query(
      `SELECT * FROM orders WHERE ORD_NUM=${req.params.order_id}`
    );
    if (updatedObject.length != 0) {
      res.status(200).json(updatedObject);
    } else {
      res
        .status(400)
        .send({ responseMessage: "No record found with given Id" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ responseMessage: error.message });
  }
});

/**
 * @swagger
 * /order/{order_id}:
 *      delete:
 *          description: remove the company object using order_id
 *          produces:
 *              -application/json
 *          responses:
 *              200:
 *                  description: successfully deleted the Order
 *              400:
 *                  description: Id not found to delete
 *              500:
 *                  description: internal server error occured
 *          parameters:
 *              - in: path
 *                name: order_id
 *                description: Order id that has to be deleted
 *                type: string
 *                required: true
 */
app.delete("/order/:order_id", async (req, res) => {
  try {
    if (typeof req.params.order_id != "undefined") {
      let response = await pool.query(
        `DELETE FROM orders WHERE ORD_NUM=\"${req.params.order_id}\"`
      );
      res.status(200).json(response);
    } else {
      res.status(400).send({ responseMessage: "Invalid input criteria" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ responseMessage: error.message });
  }
});

app.listen(port, () => {
  console.log(`API served at http://localhost:${port}`);
});
