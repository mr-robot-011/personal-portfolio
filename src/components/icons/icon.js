import React from 'react';
import PropTypes from 'prop-types';
// Import icons directly to avoid circular dependency with index.js re-exporting Icon.
import IconAppStore from './appstore';
import IconBookmark from './bookmark';
import IconCodepen from './codepen';
import IconExternal from './external';
import IconFolder from './folder';
import IconFork from './fork';
import IconGitHub from './github';
import IconInstagram from './instagram';
import IconLinkedin from './linkedin';
import IconLoader from './loader';
import IconLogo from './logo';
import IconPlayStore from './playstore';
import IconStar from './star';
import IconTwitter from './twitter';
import IconFacebook from './facebook';

const Icon = ({ name }) => {
  switch (name) {
    case 'AppStore':
      return <IconAppStore />;
    case 'Bookmark':
      return <IconBookmark />;
    case 'Codepen':
      return <IconCodepen />;
    case 'External':
      return <IconExternal />;
    case 'Folder':
      return <IconFolder />;
    case 'Fork':
      return <IconFork />;
    case 'GitHub':
      return <IconGitHub />;
    case 'Instagram':
      return <IconInstagram />;
    case 'Linkedin':
      return <IconLinkedin />;
    case 'Loader':
      return <IconLoader />;
    case 'Logo':
      return <IconLogo />;
    case 'PlayStore':
      return <IconPlayStore />;
    case 'Star':
      return <IconStar />;
    case 'Twitter':
      return <IconTwitter />;
    case 'Facebook':
      return <IconFacebook />;
    default:
      return <IconExternal />;
  }
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Icon;
