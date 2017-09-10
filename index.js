/**
 * 为index.html中的js和css链接加上timestamp参数
 */

const URL = require('url')
const path = require('path')
const fs = require('fs')
const merge = require('webpack-merge')
const hasha = require('hasha')

function StaticLinkSubstitute(options) {
  this.options = merge(options, {})
}
StaticLinkSubstitute.prototype.process_url = function (url_string, param_type='timestamp') {
  var public_path = this.options.public_path
  var root_path = this.options.static_path
  var url_obj = URL.parse(url_string)
  var param = ""
  var filepath = path.join(root_path, url_obj.pathname)
  console.log(filepath)
  if(!fs.existsSync(filepath)){
    console.log('file not exists')
    return url_string
  }
  if(url_string.startsWith(public_path)){
    return url_string
  }
  if(param_type === 'hash'){
    var filehash = hasha.fromFileSync(filepath, {algorithm: 'md5', encoding: 'hex'})
    param = "hash=" + filehash
  } else if(param_type === 'timestamp'){
    var timestamp = new Date().getTime()
    param = "ts=" + timestamp
  }
  url_string = public_path + url_obj.pathname + '?'
  if(url_obj.query){
      url_string += url_obj.query + '&' + param 
  } else {
      url_string += param
  }
  return url_string
}

StaticLinkSubstitute.prototype.apply = function(compiler) {
  let thiz = this
  let output = compiler.options.output
  if(!this.options.public_path){
    this.options.public_path = output.publicPath
  }
  if(!this.options.static_path){
    if(output.static_path){
      this.options.static_path = output.static_path
    } else {
      this.options.static_path = output.path
    }
  }
  compiler.plugin('emit', function(compilation, callback) {
    var html_content = compilation.assets['index.html'].source()
    html_content = html_content.replace(/<link(.*?)href="?(.+?)"?\s+?(.*?)\/?>/g, function(match, p1, p2, p3, offset, string){
      p2 = thiz.process_url(p2)
      return '<link' + p1 + 'href="' + p2 + '" ' + p3 + ' />'
    })
    html_content = html_content.replace(/<script([^<>]*)src="?([^<> "]+)"?([^<>]*)>/g, function(match, p1, p2, p3, offset, string){
      p2 = thiz.process_url(p2)
      return '<script' + p1 + 'src="' + p2 + '" ' + p3 + '>'
    })
    compilation.assets['index.html'].source = function () {
      return html_content
    }
    callback();
  });
};

module.exports = StaticLinkSubstitute;