var redis = require('redis');
var client = redis.createClient();
var _ = require('lodash');
var crypto = require('crypto');
var Promise = require('bluebird')

function log(req,res,next){
  var path = req.path;
  if(path[path.length-1] === '/') path=path.slice(0,path.length-2);
  client.hset(`path:${path}`,`${req.ip}|${Date.now()}`,
  JSON.stringify(
    {ip:req.ip,timestamp:Date.now()}
  ))
  next();
}
function get(endpoint,cb){
  var logs = [];
  if(endpoint){
    client.hgetall(`path:${endpoint}`,(err,logs)=>{
      // console.log('logs are: ', endpoint,JSON.stringify(logs))
      if(!err) cb(null,logs)
      else cb(new Error('could not get'))
    })
  } else {
    cb('no endpoint provided');
  }
}

function stripPrefix(str){
  return str.replace('path:/v1/','')
}

function getAll(cb){
  client.keys('path:/*',(err,keys)=>{
    console.log(keys)
    var promises = keys.map(
      k=> {
        return new Promise((resolve,reject)=>{
          client.hgetall(k,(err,logs)=>{
            var entries = _.toArray(logs).map(e => JSON.parse(e));
            var endpoint = stripPrefix(k);
            return resolve({endpoint,logs:entries});
          })
        }
      )
    }
  )
  var res = Promise.all(promises).then(logsets=>{
    cb(null,logsets);
  });
})
}

module.exports = {
  log:log,
  get:get,
  getAll:getAll
}
