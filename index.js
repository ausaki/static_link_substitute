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
  var public_path = this.options.output.publicPath
  var root_path = this.options.output.path
  var url_obj = URL.parse(url_string)
  var param = ""
  if(param_type === 'hash'){
    var filepath = path.join(root_path, url_obj.pathname)
    if(!fs.existsSync(filepath)){
        return url_string
    }
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
  var thiz = this
  this.options = merge(compiler.options, this.options)
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