import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { fetchJson } from '../lib/fetch';
import supportedFiles from '../lib/dependencies/supported-files';

import { Link, Router } from '../routes';

import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import Upload from '../components/Upload';
import Footer from '../components/Footer';
import GithubLogo from '../static/img/icon-github.svg';
import UploadIcon from '../static/img/upload-icon.svg';

const getUserOrgs = accessToken =>
  process.env.IS_CLIENT
    ? fetchJson('/data/getUserOrgs')
    : import('../lib/data').then(m => m.getUserOrgs(accessToken));

export default class Index extends Component {
  static async getInitialProps({ req }) {
    const initialProps = {};

    let accessToken;
    if (req) {
      accessToken = get(req, 'session.passport.user.accessToken');
    } else if (typeof window !== 'undefined') {
      accessToken = get(
        window,
        '__NEXT_DATA__.props.pageProps.loggedInUser.accessToken',
      );
    }
    if (accessToken) {
      initialProps.loggedInUserOrgs = await getUserOrgs(accessToken);
    }

    return initialProps;
  }

  static propTypes = {
    pathname: PropTypes.string,
    loggedInUser: PropTypes.object,
    loggedInUserOrgs: PropTypes.array,
  };

  onUpload = () => {
    Router.pushRoute('files');
  };

  render() {
    const { pathname, loggedInUser, loggedInUserOrgs } = this.props;

    const supportedFilesAsComponent = supportedFiles
      .map(file => <em key={file}>{file}</em>)
      .reduce((acc, curr, idx, src) => {
        if (idx === 1) {
          return [curr];
        } else if (src.length - 1 === idx) {
          return [...acc, ' and ', curr];
        } else {
          return [...acc, ', ', curr];
        }
      });

    return (
      <div className="Page IndexPage">
        <style jsx global>
          {`
            @media screen and (max-width: 500px) {
              .IndexPage {
                padding: 20px;
              }
            }
          `}
        </style>

        <style jsx>
          {`
            h1 {
              width: 220px;
              margin: 0 auto 25px;
              padding: 0;
            }

            p {
              text-align: center;
              color: #9399a3;
            }
            .homepage {
              background: url(/static/img/background-colors.svg);
              background-repeat: no-repeat;
              display: flex;
              flex-direction: column;
              width: 100%;
              align-items: center;
            }
            .description {
              color: #141414;
              font-weight: 800;
              font-size: 32px;
              line-height: 40px;
              text-align: center;
              width: 55%;
              letter-spacing: -0.4px;
              margin: 20px;
            }
            .asterisk {
              color: #180c66;
            }
            .secondaryDescription {
              font-size: 12px;
              color: #4e5052;
              line-height: 18px;
              font-weight: 200;
              width: 45%;
            }
            .seeHowLink {
              text-decoration: none;
              color: #7042ff;
            }
            .optionsDescription {
              font-weight: 400;
              font-size: 16px;
              line-height: 24px;
              color: #4e5052;
              width: 50%;
            }
            .boxWrapper {
              width: 100%;
              display: flex;
              justify-content: center;
              margin-bottom: 20px;
            }
            .box {
              width: 450px;
              display: flex;
              flex-direction: column;
              min-height: 340px;
              background: #fff;
              border: 1px solid rgba(24, 26, 31, 0.1);
              border-radius: 8px;
              margin: 20px;
              padding: 10px 20px;
            }
            .boxHeader {
              display: flex;
              align-items: baseline;
              color: #4e5052;
              font-size: 16px;
              line-height: 24px;
            }
            .icon {
              margin-right: 20px;
              width: 16px;
              height: 16px;
            }
            .boxDescription {
              text-align: left;
              font-size: 14px;
              line-height: 22px;
              color: #76777a;
              letter-spacing: -0.2px;
            }
            .uploadContainer {
              width: 280px;
              align-self: center;
            }
            @media screen and (max-width: 500px) {
              h1 {
                margin-bottom: 25px;
              }
              .description,
              .secondaryDescription,
              .optionsDescription {
                width: 80%;
              }
              .boxWrapper {
                flex-direction: column;
              }
              .uploadContainer,
              .box {
                width: 80%;
              }
            }
          `}
        </style>

        <Header pathname={pathname} loggedInUser={loggedInUser} />

        <div className="homepage">
          <h3 className="description">
            Discover the Open Source projects
            <small className="asterisk">
              <sup>*</sup>
            </small>{' '}
            your organization is using that need financial support.
          </h3>
          <p className="secondaryDescription">
            <span className="asterisk">*</span>We currently detect dependencies
            from JavaScript (NPM), PHP (Composer), .NET (Nuget), Go (dep) and
            Ruby (Gem). Want to see something else?{' '}
            <Link route="contributing">
              <a className="seeHowLink">See how to contribute</a>
            </Link>
            .
          </p>
          <p className="optionsDescription">
            You have <strong>two different</strong> options to perform an
            analysis of your code to know which{' '}
            <strong>Open Source Projects</strong> you are going to contribute
            to.
          </p>
          <div className="boxWrapper">
            <div className="box">
              <div className="boxHeader">
                <div className="icon">
                  <GithubLogo />
                </div>
                <h3>Use your github link</h3>
              </div>
              <p className="boxDescription">
                Just copy and paste the URL of the repository that you want to
                scan and set a contribution.
              </p>
              <SearchForm orgs={loggedInUserOrgs} />
            </div>
            <div className="box">
              <div className="boxHeader">
                <div className="icon">
                  <UploadIcon />
                </div>
                <h3>Upload your own file</h3>
              </div>
              <p className="boxDescription">
                If you want to analyze non-public repositories, sign in with
                your GitHub account or simply upload dependency files. At the
                moment, we do support {supportedFilesAsComponent}.
              </p>
              <div className="uploadContainer">
                <Upload
                  onUpload={this.onUpload}
                  feedbackPosition="float"
                  style={{ height: '75px' }}
                />
              </div>
              <p className="boxDescription">
                The uploaded files will not be shared with anyone and will be
                deleted when your session expire.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
