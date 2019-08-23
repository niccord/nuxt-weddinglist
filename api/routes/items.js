'use strict';

const { Router } = require('express')
const { Client } = require('pg');

require('dotenv').config();

const pgUser = process.env.POSTGRESUSER;
const pgPassword = process.env.POSTGRESPASSWORD;
const pgIp = process.env.POSTGRESSIP;
const pgPort = process.env.POSTGRESSPORT;
const pgDatabaseName = process.env.POSTGRESSDATABASENAME;
const connectionString = `postgresql://${pgUser}:${pgPassword}@${pgIp}:${pgPort}/${pgDatabaseName}`;
const client = new Client({ connectionString });
client.connect();

const router = Router();

router.get('/items', async function (req, res, next) {
  const items = await client.query('SELECT * FROM v_item')
  res.json(items.rows)
})

router.get('/categories', async function (req, res, next) {
  const cat = await client.query('SELECT * FROM category')
  res.json(cat.rows)
})

module.exports = router
