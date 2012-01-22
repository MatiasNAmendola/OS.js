/*!
 * Application: ApplicationTextpad
 *
 * @package OSjs.Applications
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Applications.ApplicationTextpad = (function($, undefined) {
  "$:nomunge";

  return function(GtkWindow, Application, API, argv, windows) {
    "GtkWindow:nomunge, Application:nomunge, API:nomunge, argv:nomunge, windows:nomunge";

    function _read_file(win,file) {
      var txt = win.$element.find("textarea");
      if ( typeof file == "string" && file ) {
        API.system.call("read", file, function(result, error) {
          if ( error === null ) {
            txt.val(result);
            _update(file, win);

            setTimeout(function() {
              setSelectionRangeX(txt.get(0), 0, 0);
            }, 0);
          } else {
            _update(null, win);
          }
        });
      } else {
        _update(null, win);
      }

      _updateStatusbar(win.$element);
      txt.focus();
    }

    function _update(file, win) {
      argv['path'] = file;

      win.setTitle(win._origtitle + ": " + (file || "New file"));

      _updateStatusbar(win.$element);
    }

    function _updateStatusbar(el) {
      var txt = $(el).find("textarea");
      var pos = getTextareaCoordinates(txt);
      var text = sprintf("Row: %d, Col: %d, Lines: %d, Characters: %d", pos.y, pos.x, pos.lines, pos.length);
      $(el).find(".statusbar1").html(text);
    }

    var Window_window1 = GtkWindow.extend({

      init : function(app) {
        this._super("Window_window1", false, app, windows);
        this._content = $("<div class=\"window1\"> <div class=\"GtkWindow ApplicationTextpad window1\"> <table class=\"GtkBox Vertical box1\"> <tr> <td class=\"Fill GtkBoxPosition Position_0\"> <div class=\"TableCellWrap\"> <ul class=\"GtkMenuBar menubar1\"> <li class=\"GtkMenuItem menuitem1\"> <span><u>F</u>ile</span> <ul class=\"GtkMenu menu1\"> <li class=\"GtkImageMenuItem imagemenuitem_new\"> <img alt=\"gtk-new\" src=\"/img/icons/16x16/actions/gtk-new.png\"/> <span>New</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_open\"> <img alt=\"gtk-open\" src=\"/img/icons/16x16/actions/gtk-open.png\"/> <span>Open</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_save\"> <img alt=\"gtk-save\" src=\"/img/icons/16x16/actions/gtk-save.png\"/> <span>Save</span> </li> <li class=\"GtkImageMenuItem imagemenuitem_saveas\"> <img alt=\"gtk-save-as\" src=\"/img/icons/16x16/actions/gtk-save-as.png\"/> <span>Save as...</span> </li> <div class=\"GtkSeparatorMenuItem separatormenuitem1\"></div> <li class=\"GtkImageMenuItem imagemenuitem_quit\"> <img alt=\"gtk-quit\" src=\"/img/icons/16x16/actions/gtk-quit.png\"/> <span>Quit</span> </li> </ul> </li> </ul> </div> </td> </tr> <tr> <td class=\"Expand Fill GtkBoxPosition Position_1\"> <div class=\"TableCellWrap\"> <textarea class=\"GtkTextView GtkObject textview1\"></textarea> </div> </td> </tr> <tr> <td class=\"Fill GtkBoxPosition Position_2\"> <div class=\"TableCellWrap\"> <div class=\"GtkStatusbar statusbar1\"></div> </div> </td> </tr> </table> </div> </div> ").html();
        this._title = 'Textpad';
        this._icon = 'apps/text-editor.png';
        this._is_draggable = true;
        this._is_resizable = true;
        this._is_scrollable = false;
        this._is_sessionable = true;
        this._is_minimizable = true;
        this._is_maximizable = true;
        this._is_closable = true;
        this._is_orphan = false;
        this._width = 400;
        this._height = 400;
        this._gravity = null;
      },

      destroy : function() {
        this._super();
      },


      EventMenuNew : function(el, ev) {
        this.$element.find("textarea").val("");
        _update(null, this);
      },


      EventMenuOpen : function(el, ev) {
        var self = this;
        var cur = (argv && argv['path'] ? argv['path'] : null);

        this.app.defaultFileOpen(function(fname) {
          _read_file(self, fname);

          setTimeout(function() {
            setSelectionRangeX($(el).find("textarea"), 0, 0);
          }, 0);
        }, ["text/*"], null, cur);
      },


      EventMenuSave : function(el, ev) {
        var self = this;

        if ( argv && argv['path'] ) {
          var path = argv['path'];
          var data = self.$element.find("textarea").val();

          this.app.defaultFileSave(path, data, function(fname) {
            (function() {})();
          }, ["text/*"], undefined, false);
        }
      },


      EventMenuSaveAs : function(el, ev) {
        var self = this;
        var data = self.$element.find("textarea").val();
        var cur  = (argv && argv['path'] ? argv['path'] : null);

        this.app.defaultFileSave(cur, data, function(fname, mime) {
          _update(fname, self);
        }, ["text/*"], undefined, true);
      },


      EventMenuQuit : function(el, ev) {
        this.$element.find(".ActionClose").click();
      },



      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {

          el.find(".imagemenuitem_new").click(function(ev) {
            self.EventMenuNew(this, ev);
          });

          el.find(".imagemenuitem_open").click(function(ev) {
            self.EventMenuOpen(this, ev);
          });

          el.find(".imagemenuitem_save").click(function(ev) {
            self.EventMenuSave(this, ev);
          });

          el.find(".imagemenuitem_saveas").click(function(ev) {
            self.EventMenuSaveAs(this, ev);
          });

          el.find(".imagemenuitem_quit").click(function(ev) {
            self.EventMenuQuit(this, ev);
          });

          // Do your stuff here

          this._bind("focus", function() {
            el.find("textarea").focus();
            _updateStatusbar(el);
          });

          _read_file(self, argv['path']);

          $(el).find("textarea").mousedown(function(ev) {
            _updateStatusbar(el);
            //ev.stopPropagation();
          }).focus(function() {
            _updateStatusbar(el);
          }).keyup(function() {
            _updateStatusbar(el);
          });
        }

      }
    });


    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    var __ApplicationTextpad = Application.extend({

      init : function() {
        this._super("ApplicationTextpad", argv);
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

        var root_window = new Window_window1(self);
        this._super(root_window);
        root_window.show();


        // Do your stuff here
      }
    });

    return new __ApplicationTextpad();
  };
})($);
