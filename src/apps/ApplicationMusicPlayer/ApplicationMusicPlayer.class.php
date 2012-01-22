<?php
/*!
 * @file
 * Contains ApplicationMusicPlayer Class
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2011-05-23
 */

/**
 * ApplicationMusicPlayer Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Applications
 * @class
 */
class ApplicationMusicPlayer
  extends Application
{

  /**
   * Create a new instance
   */
  public function __construct() {
    parent::__construct();
  }

  public static function Event($uuid, $action, Array $args) {
    if ( $action == "info" ) {
      return ApplicationAPI::mediaInfo($args['path']);
    }

    return false;
  }
}


?>
