/*!
 * OperationDialog: UploadOperationDialog
 * Upload file dialog
 *
 * @package OSjs.Dialogs
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Dialogs.UploadOperationDialog = (function($, undefined) {
  "$:nomunge";

  return function(OperationDialog, API, argv) {
    "OperationDialog:nomunge, API:nomunge, argv:nomunge";

    var _UploadOperationDialog = OperationDialog.extend({
      init : function(uri, path, clb_finish, clb_progress, clb_cancel) {
        this.upload_uri   = uri;
        this.uploader     = null;
        this.upload_path  = path;
        this.clb_finish   = clb_finish   || function() {};
        this.clb_progress = clb_progress || function() {};
        this.clb_cancel   = clb_cancel   || function() {};

        this._super("Upload");
        this._title    = "Upload file";
        this._icon     = "actions/up.png";
        this._content  = $("#OperationDialogUpload").html();
        this._width    = 400;
        this._height   = 180;
      },

      create : function(id, mcallback) {
        this._super(id, mcallback);

        var self    = this;
        var pbar    = this.$element.find(".ProgressBar");
        var sbar    = this.$element.find("p.Status");
        this.$element.find(".DialogButtons").hide();

        // Create uploader
        var fname = "";
        var fsize = 0;
        var ftype = "";

        try {
          pbar.progressbar({ value : 0 });

          var u = new OSjs.Classes.Uploader(self.upload_uri, self.upload_path, function(name, size, type) {
            fname = name;
            fsize = size;
            ftype = type;

            pbar.progressbar({ value : 0 });
            sbar.html(sprintf("%s (%s)", fname, fsize));
          }, function(progress) {
            var pr = (parseInt(progress, 10) || 0);
            pbar.progressbar({ value : pr });
            sbar.html(sprintf("%s (%s%% of %s)", fname, pr, fsize));

            self.clb_progress(fname, pr, fsize);
          }, function(response) {
            pbar.progressbar({ value : 100 });
            sbar.html(sprintf("Finished %s (%s)", fname, fsize));

            setTimeout(function() {
              self.$element.find(".ActionClose").click();
            }, 100);

            self.clb_finish(fname);
          }, function(error) {
            sbar.html(sprintf("Failed %s", fname));

            alert(sprintf("Failed to upload %s: %s", fname, error));

            self.clb_cancel(fname, error);
          });


          var form = sprintf("<div style=\"position:relative;margin-top:10px;\"><form action=\"%s\" method=\"post\" enctype=\"multipart/form-data\" class=\"FileForm\"><input type=\"hidden\" name=\"path\" value=\"/\" /><div class=\"file\"><input type=\"file\" name=\"upload\" /></div><div class=\"button\"><input type=\"submit\" name=\"upload\" value=\"Upload\"/></div></form></div>", this.upload_uri);
          var doc = $(form);
          $(doc).find("div.button").css({
            "display"   : "block",
            "position"  : "absolute",
            "bottom"    : "-40px",
            "left"      : "0px"
          });

          this.$element.find(".OperationDialogInner").append(doc);
          this.$element.find("form").get(0).onsubmit = function() {
            if ( fname ) {
              u.upload(self.$element.find("form"));
            } else {
              alert("You need to choose a file first!");
            }
            return false;
          };

          u.run(this.$element.find("input[type=file]").get(0));

          this.uploader = u;
        } catch ( eee ) {
          alert("You cannot upload files because an error occured:\n" + eee);
        }
      },

      destroy : function() {
        if ( this.uploader ) {
          this.uploader.destroy();
          this.uploader = null;
        }

        this._super();
      }
    });

    return construct(_UploadOperationDialog, argv);
  };
})($);
