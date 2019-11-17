'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 


AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {

  // jsonそのままPOSTする場合
  // jsonをPOSTする前にjson.stringifyしているならば、JSON.parse(event.body)
  const requestBody = event.body;

  const fullname = requestBody.fullname;
  const email = requestBody.email;
  const img = requestBody.img;


  if (typeof fullname !== 'string' || typeof email !== 'string' || typeof img !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit candidate because of validation errors.'));
    return;
  }

  submitCandidateP(candidateInfo(fullname, email, img))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted candidate with email ${email}`,
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit candidate with email ${email}`
        })
      })
    });
};


const submitCandidateP = candidate => {
  console.log('Submitting candidate');
  const candidateInfo = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: candidate,
  };
  return dynamoDb.put(candidateInfo).promise()
    .then(res => candidate);
};

const candidateInfo = (fullname, email, img) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    fullname: fullname,
    email: email,
    img: img,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports.list = (event, context, callback) => {
  var params = {
      TableName: process.env.CANDIDATE_TABLE,
      ProjectionExpression: "id, fullname, img"
  };

  console.log("Scanning Candidate table.");
  const onScan = (err, data) => {

      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*', // Required for CORS support to work
                'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
              },
              body: JSON.stringify({
                  candidates: data.Items
              })
          });
      }

  };

  dynamoDb.scan(params, onScan);

};