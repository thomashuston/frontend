import React from 'react';

import Chooser from '../../shared/Chooser';
import Dropdown from '../../shared/Dropdown';

import TeamMemberRoleConstants from '../../../constants/TeamMemberRoleConstants';

class MemberRole extends React.PureComponent {
  static displayName = "Team.Pipelines.Role";

  static propTypes = {
    teamMember: React.PropTypes.shape({
      role: React.PropTypes.string.isRequired
    }).isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    savingNewRole: React.PropTypes.string
  };

  render() {
    const saving = this.props.savingNewRole;

    return (
      <Dropdown width={270}>
        <div className="underline-dotted cursor-pointer inline-block regular">{this.label(this.props.teamMember.role)}</div>

        <Chooser selected={this.props.teamMember.role} onSelect={this.props.onRoleChange}>
          <Chooser.SelectOption
            value={TeamMemberRoleConstants.MAINTAINER}
            saving={saving === TeamMemberRoleConstants.MAINTAINER}
            selected={this.props.teamMember.role === TeamMemberRoleConstants.MAINTAINER}
            label={this.label(TeamMemberRoleConstants.MAINTAINER)}
            description="Manage members and pipelines with unrestricted access"
          />
          <Chooser.SelectOption
            value={TeamMemberRoleConstants.MEMBER}
            saving={saving === TeamMemberRoleConstants.MEMBER}
            selected={this.props.teamMember.role === TeamMemberRoleConstants.MEMBER}
            label={this.label(TeamMemberRoleConstants.MEMBER)}
            description="Create and access pipelines based on each pipeline’s permissions"
          />
        </Chooser>
      </Dropdown>
    );
  }

  label(value) {
    switch (value) {
      case TeamMemberRoleConstants.MAINTAINER:
        return "Maintainer";
      case TeamMemberRoleConstants.MEMBER:
        return "Member";
    }
  }
}

export default MemberRole;
