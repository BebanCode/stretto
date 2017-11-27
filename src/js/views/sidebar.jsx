import { h, Component } from 'preact';
import Link from 'react-router/lib/Link';
import Bootbox from '../services/bootbox';
import PlayerControls from './player_controls';
import PlayerInfo from './player_info';
import Playlist from '../models/playlist';
import autobind from 'autobind-decorator';

class Sidebar extends Component {
  constructor() {
    super();
    Playlist.addOnChangeListener(this.onPlaylistChange);
  }

  render() {
    return (
      <div class='sidebar'>
        <div class='sidebar-top'>
          <h3 class='logo'>
            <Link to='/' style={{ textDecoration: 'none' }}>Stretto</Link>
            <Link class='sidebar-icon' to='/settings/'><span class='glyphicon glyphicon-cog'></span></Link>
            <Link class='sidebar-icon' to='/add/'><span class='glyphicon glyphicon-plus'></span></Link>
            <Link class='sidebar-icon' to='/sync/'><span class='glyphicon glyphicon-refresh'></span></Link>
          </h3>
          <ul class='nav nav-pills nav-stacked'>
            <li class="dropdown-header">Add to Library</li>
            <li><Link to='/spotify/'>Import from Spotify</Link></li>
            <li><Link to='/import/'>Import from Stretto 1.x (JSON)</Link></li>
            <li class="dropdown-header">Your Music</li>
            { Playlist.fetchAll().map((playlist) =>
              <li>
                <Link to={'/playlist/' + playlist.title}>
                  { playlist.title }
                </Link>
              </li>
            ) }
            <li onClick={this.addNewPlaylist}><a href='#'>Add new playlist</a></li>
          </ul>
        </div>
        <div class='sidebar-bottom'>
          <PlayerControls />
          <PlayerInfo />
        </div>
      </div>
    );
  }

  addNewPlaylist() {
    Bootbox.prompt('What do you want the new playlist title to be?').then((name) => {
      Playlist.create({
        title: name
      });
    });
  }

  @autobind
  onPlaylistChange() {
    this.setState({});
  }
}

module.exports = Sidebar;
