import React from 'react';
import shuffle from 'shuffle-array';

import Dialog from '../../shared/Dialog';
import Button from '../../shared/Button';
import Emojify from '../../shared/Emojify';

const PEOPLE = [
  { image: "keithpitt", name: "Keith Pitt" },
  { image: "harriet", name: "Harriet Lawrence" },
  { image: "ticky", name: "Jessica Stokes" },
  { image: "sj26", name: "Sam Cochran" },
  { image: "toolmantim", name: "Tim Lucas" }
];

class SupportDialog extends React.Component {
  static displayName = "Navigation.SupportDialog";

  static propTypes = {
    isOpen: React.PropTypes.bool,
    onRequestClose: React.PropTypes.func
  };

  render() {
    return (
      <Dialog isOpen={this.props.isOpen} onRequestClose={this.props.onRequestClose}>
        <h1 className="bold mt0 mb4"><Emojify text="We’re here to help :wave:"/></h1>
        <div className="mb4 pt3 px3">
          {shuffle(PEOPLE).map((person) => <img key={person.name} src={require(`../../../images/people/${person.image}.jpg`)} width={70} height={70} alt={person.name} title={person.name} className="circle border border-white" style={{ marginLeft: -5 }} />)}
        </div>
        <div className="mx-auto mb4 pt1 px3">If you have a question, problem, or just need a hand send us an email and we’ll help you out!</div>

        <div className="pt1">
          <Button href="mailto:support@buildkite.com" theme="default" outline={true}>Email support@buildkite.com</Button>
        </div>
      </Dialog>
    )
  }
}

export default SupportDialog;
