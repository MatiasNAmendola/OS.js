/*!
 * @file
 * OS.js - JavaScript Operating System - VFS
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2013-01-27
 */

/*
 * TODO: Secure input
 */

var fs        = require('fs'),
    http      = require('http'),
    url       = require('url'),
    walk      = require('walk'),
    sanitize  = require('validator').sanitize;

var _config = require('../config.js');

function _ls(args, callback) {
  var path = _config.PATH_MEDIA + args; // FIXME
  var walker = walk.walk(path, { followLinks: false });
  var files  = {
    ".." : {
      path        : path,
      size        : 0,
      mime        : null,
      icon        : 'emblems/emblem-unreadable.png', // FIXME
      type        : 'dir',
      'protected' : 0 // FIXME
    }
  };

  walker.on('file', function(root, stat, next) {
    files[stat.name] = {
      path         : root,
      size         : stat.size,
      mime         : "todo/todo", // FIXME
      icon         : 'emblems/emblem-unreadable.png', // FIXME
      type         : "file",
      'protected'  : 0 // FIXME
    };
  });

  walker.on('end', function() {
    callback(true, files);
  });
}

function _cat(filename, callback) {
  filename = _config.PATH_MEDIA + filename; // FIXME
  fs.readFile(filename, function(err, data) {
    if ( err ) {
      callback(false, err || "File not found or permission denied!");
    } else {
      callback(true, data.toString());
    }
  });
}

function _exists(filename, callback) {
  filename = _config.PATH_MEDIA + filename; // FIXME

  fs.exists(filename, function(ex) {
    if ( ex ) {
      callback(true, true);
    } else {
      callback(true, false);
    }
  });
}

function _mkdir(path, callback) {
  var filename = _config.PATH_MEDIA + path; // FIXME
  fs.mkdir(filename, '0777', function(err, files) {
    if ( err ) {
      callback(false, err);
    } else {
      callback(true, true);
    }
  });
}

function _touch(path, callback) {
  var filename = _config.PATH_MEDIA + path; // FIXME
  _exists(filename, function(sucess, result) {
    if ( success ) {
      callback(true, false);
    } else {
      fs.writeFile(filename, "", function(err) {
        if ( err ) {
          callback(false, err);
        } else {
          callback(true, true);
        }
      });
    }
  });
}

function _rm(path, callback) {
  var filename = _config.PATH_MEDIA + path; // FIXME
  _exists(filename, function(sucess, result) {
    if ( success ) {
      fs.unlink(filename, function(err) {
        if ( err ) {
          callback(false, err);
        } else {
          callback(true, true);
        }
      });
    } else {
      callback(true, false);
    }
  });
}

module.exports =
{
  // Base
  ls        : _ls,
  readdir   : _ls,
  cat       : _cat,
  read      : _cat,
  exists    : _exists,
  mkdir     : _mkdir,
  touch     : _touch,
  'delete'  : _rm,
  rm        : _rm,

  // preview
  // rename
  // mv
  // put
  // write
  // file_info
  // fileinfo
  // readpdf
  // cp
  // copy
  // upload
  // ls_archive
  // extract_archive

  // Wrappers
  lswrap  : function(args, callback) {
    _ls(args.path, function(success, result) {
      if ( success ) {
        var ls_items = [];
        var ls_bytes = 0;
        var ls_path  = args.path; // FIXME

        var iter;
        for ( var f in result ) {
          if ( result.hasOwnProperty(f) ) {
            iter = result[f];

            ls_bytes += iter.size;

            ls_items.push({
                icon        : iter.icon,
                type        : iter.type,
                mime        : sanitize(iter.mime).entityEncode(),
                name        : sanitize(f).entityEncode(),
                path        : iter.path,
                size        : iter.size,
                hsize       : iter.size + "b", // FIXME
                'protected' : 0 // FIXME
            });
          }
        }

        var data = {
          items : ls_items,
          total : ls_items.length,
          bytes : ls_bytes,
          path  : ls_path
        };

        callback(true, data);
      } else {
        callback(false, result);
      }
    });
  },

  // Extern
  readurl : function(args, callback) {
    if ( args !== null ) {
      var qdata   = url.parse(args, true);
      var options = {
        host    : qdata.host || "http://localhost",
        port    : qdata.port || 80,
        path    : qdata.path || "/"
      };

      http.get(options, function(res) {
        if ( res.statusCode === 200 ) {
          res.setEncoding('utf8'); // FIXME !?
          res.on('data', function (chunk) {
            callback(true, chunk);
          });
        } else {
          callback(false, "Failed to read URL: HTTP Code " + res.statusCode);
        }
      }).on('error', function(e) {
        callback(false, "Failed to read URL: " + e.message);
      });
    } else {
      callback(false, "Invalid URL!");
    }
  }
};

