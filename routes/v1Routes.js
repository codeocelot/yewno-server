var express = require('express');
var router = express.Router();
var logger = require('../logger/logger');
var _ = require('lodash')

router.get('/hello-world',function(req,res,next){
  res.json({message:'hello world'}).status(200);
});

router.get('/logs',function(req,res,next){
  logger.getAll((err,logset)=>{
    if(err) res.json({err:'could not get logs'});
    else{
      res.json({logset}).status(200);
    }
  })
});

router.get('/hello-world/logs',function(req,res,next){
  logger.get('/v1/hello-world',(err,logs)=>{
    if(!err){
      logs = _.toArray(logs).map(l=>JSON.parse(l));
      res.json({
        logs
      })
    } else {
      res.json({err:'could not get logs'}).status(500);
    }
  })
})

function parseValues(str){
  return JSON.parse(str);
}

module.exports = router;
