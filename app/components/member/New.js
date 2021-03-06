import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import DocumentTitle from 'react-document-title';

import Button from '../shared/Button';
import FormRadioGroup from '../shared/FormRadioGroup';
import FormTextarea from '../shared/FormTextarea';
import FormInputLabel from '../shared/FormInputLabel';
import FormInputHelp from '../shared/FormInputHelp';
import Panel from '../shared/Panel';
import PageHeader from '../shared/PageHeader';
import MemberTeamRow from './MemberTeamRow';

import FlashesStore from '../../stores/FlashesStore';
import ValidationErrors from '../../lib/ValidationErrors';

import OrganizationInvitationCreateMutation from '../../mutations/OrganizationInvitationCreate';

import OrganizationMemberRoleConstants from '../../constants/OrganizationMemberRoleConstants';
import GraphQLErrors from '../../constants/GraphQLErrors';
import TeamMemberRoleConstants from '../../constants/TeamMemberRoleConstants';

class MemberNew extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.shape({
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      teams: PropTypes.shape({
        count: PropTypes.number.isRequired,
        edges: PropTypes.arrayOf(
          PropTypes.shape({
            node: PropTypes.shape({
              id: PropTypes.string.isRequired,
              slug: PropTypes.string.isRequired,
              isDefaultTeam: PropTypes.bool.isRequired
            }).isRequired
          })
        ).isRequired
      })
    }).isRequired,
    relay: PropTypes.object.isRequired
  };

  static contextTypes = {
    router: PropTypes.object
  };

  state = {
    emails: '',
    teams: null, // when mounted we set this to the default teams
    role: OrganizationMemberRoleConstants.MEMBER,
    errors: null
  };

  componentDidMount() {
    this.props.relay.forceFetch({ isMounted: true });
  }

  componentWillReceiveProps(nextProps) {
    // Initialize state teams to default teams when mounted and we get props
    if (this.state.teams === null && nextProps.organization.teams) {
      const defaultTeams = nextProps.organization.teams.edges
        .filter(({ node }) => node.isDefaultTeam)
        .map(({ node }) => node.id);

      this.setState({ teams: defaultTeams });
    }
  }

  render() {
    const errors = new ValidationErrors(this.state.errors);

    return (
      <DocumentTitle title={`Users · ${this.props.organization.name}`}>
        <div>
          <PageHeader>
            <PageHeader.Title>
              Invite Users
            </PageHeader.Title>
          </PageHeader>
          <Panel>
            <Panel.Section>
              <FormTextarea
                label="Email Addresses"
                help="This list of email addresses to invite, each one separated with a space or a new line"
                value={this.state.emails}
                errors={errors.findForField("emails")}
                onChange={this.handleEmailsChange}
                rows={3}
                required={true}
              />
            </Panel.Section>
            <Panel.Section>
              <FormRadioGroup
                name="role"
                label="Role"
                help="What type of organization-wide permissions will the invited users have?"
                value={this.state.role}
                onChange={this.handleAdminChange}
                required={true}
                options={[
                  { label: "User", value: OrganizationMemberRoleConstants.MEMBER, help: "Can view, create and manage pipelines and builds." },
                  { label: "Administrator", value: OrganizationMemberRoleConstants.ADMIN, help: "Can view and edit everything in the organization." }
                ]}
              />
            </Panel.Section>
            <Panel.Section>
              {this.renderTeamSection()}
            </Panel.Section>
            <Panel.Section>
              <Button
                onClick={this.handleCreateInvitationClick}
                loading={this.state.inviting && 'Sending Invitations…'}
              >
                Send Invitations
              </Button>
            </Panel.Section>
          </Panel>
        </div>
      </DocumentTitle>
    );
  }

  handleEmailsChange = (evt) => {
    this.setState({
      emails: evt.target.value
    });
  };

  handleAdminChange = (evt) => {
    this.setState({
      role: evt.target.value
    });
  };

  handleCreateInvitationClick = () => {
    // Show the inviting indicator
    this.setState({ inviting: true });

    const emails = this.state.emails
      .replace(',', ' ')
      // WARNING: This Regexp is fully qualified rather than `\s` as
      // this is designed to mirror back-end code and functionality
      // (see `app/models/account/invitation/creator.rb`), and RegExp
      // `\s` includes more (Unicode) characters than Ruby's in newer
      // browsers (those compliant with ES2017)
      .split(/[ \t\r\n\f\v]+/gi);

    const role = this.state.role;

    let teams = [];
    if (this.state.teams) {
      teams = this.state.teams.map((id) => {
        return { id: id, role: TeamMemberRoleConstants.MEMBER };
      });
    }

    const mutation = new OrganizationInvitationCreateMutation({
      organization: this.props.organization,
      emails,
      teams,
      role
    });

    // Run the mutation
    Relay.Store.commitUpdate(mutation, {
      onSuccess: this.handleInvitationCreateSuccess,
      onFailure: this.handleInvitationCreateFailure
    });
  }

  handleInvitationCreateSuccess = () => {
    this.setState({ inviting: false });

    this.context.router.push(`/organizations/${this.props.organization.slug}/users`);
  }

  handleInvitationCreateFailure = (transaction) => {
    const error = transaction.getError();
    if (error) {
      if (error.source && error.source.type === GraphQLErrors.RECORD_VALIDATION_ERROR) {
        this.setState({ errors: transaction.getError().source.errors });
      } else {
        FlashesStore.flash(FlashesStore.ERROR, transaction.getError());
      }
    }

    this.setState({ inviting: false });
  }

  renderTeamSection() {
    // If the teams haven't loaded yet
    if (!this.props.organization.teams) {
      return null;
    }

    // If there aren't any teams then we don't have the feature
    if (this.props.organization.teams.count === 0) {
      return null;
    }

    const teamEdges = this.props.organization.teams.edges;

    return (
      <div>
        <FormInputLabel label="Teams" />
        <FormInputHelp>You can give the invited users additional permissions by adding them to one or more teams.</FormInputHelp>
        <div className="flex flex-wrap content-around mxn1 mt1">
          {teamEdges.map(({ node }) => (
            <MemberTeamRow
              key={node.id}
              team={node}
              checked={this.state.teams.includes(node.id)}
              onChange={this.handleTeamChange}
            />
          ))}
        </div>
      </div>
    );
  }

  handleTeamChange = (team) => {
    let teams;
    const teamIndex = this.state.teams.indexOf(team.id);

    if (teamIndex === -1) {
      // adding
      teams = this.state.teams.concat([team.id]);
    } else {
      // removing
      teams = this.state.teams.concat();
      teams.splice(teamIndex, 1);
    }

    this.setState({ teams });
  };
}

export default Relay.createContainer(MemberNew, {
  initialVariables: {
    isMounted: false
  },

  fragments: {
    organization: () => Relay.QL`
      fragment on Organization {
        name
        slug
        teams(first: 50) @include(if: $isMounted) {
          count
          edges {
            node {
              id
              slug
              isDefaultTeam
              ${MemberTeamRow.getFragment('team')}
            }
          }
        }
        ${OrganizationInvitationCreateMutation.getFragment('organization')}
      }
    `
  }
});
