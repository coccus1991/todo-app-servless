const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const {v4: uuidv4} = require('uuid');
const serverless = require('serverless-http');
const express = require("express");

const TASK_TABLE = process.env.TASK_TABLE;

const app = express();

app.use(express.json());

function getUnixTime() {
    return (Date.now() / 1000) | 0;
}


app.get("/task", async (req, res) => {
    const tasks = await dynamoDb.scan({
        TableName: TASK_TABLE
    }).promise();

    res.json(tasks.Items);
});

app.put("/task", async (req, res) => {
    const task = req.body;

    await dynamoDb.put({TableName: TASK_TABLE, Item: task}).promise();

    return res.json(task);
});

app.post("/task", async (req, res) => {
    let task = {
        ...req.body,
        id: uuidv4(),
        created_date: getUnixTime(),
    };

    await dynamoDb.put({TableName: TASK_TABLE, Item: task}).promise();

    res.json(task);
});

app.delete("/task/:id", async (req, res) => {
    try {
        await dynamoDb.delete({
            TableName: TASK_TABLE, Key: {
                id: req.params.id
            }
        }).promise();
    } catch (e) {
        console.log("Exception", e.message)
        res.status(500).send(e.message)

    }

    res.send("");
});


module.exports.lambdaHandler = serverless(app);
