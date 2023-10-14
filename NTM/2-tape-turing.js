import {Tape, TMParseError, strip} from "../tape.js"
export class TM2T{
  constructor(text) {
    /* Rules will be an object such that the state of turing machine will be
       the path to the next move .i.e if the state is 'q0' and the head values
       are '0' and '1' then the next move can be found in rules as:
          rules['q0']['0']['1']
          rules['q0']['0']['*']
          rules['q0']['*']['1']
          rules['q0']['*']['*']
          rules['*']['0']['1']
          rules['*']['0']['*']
          rules['*']['*']['1']
          rules['*']['*']['*']
       from highest to lowest priority where '*' is a wild card
    */
    let rules = {}

    // Remove comments and leading whitespace
    let lines = text.split(/\n/);

    // For each non empty line in the tm text
    let [i,k] = [0, 0];
    for (let line of lines) {
      line = strip(line);
      if (!(line == "" || !!line.match(/^\s*$/))) {

        // Split by whitespace characters and throw error if invalid number of
        // arguments
        let vals = line.split(/\s+/);
        if (vals.length != 8) throw new TMParseError(`Invalid parameters`, i);
        let [state0, rh1, rh2, wh1, wh2, mv1, mv2, state1] = vals;
        if (!mv1.match(/[*LRlr]/) || !mv2.match(/[*LRlr]/)) new TMParseError(`Invalid move`, i);

        // As per above structure
        if (this.start == null) this.start = state0;
        if (!(state0 in rules)) rules[state0] = {};
        if (!(rh1 in rules[state0])) rules[state0][rh1] = {};
        rules[state0][rh1][rh2] = {write1: wh1, write2: wh2, move1: mv1, move2: mv2, newstate: state1};
        k++;
      }
      i++;
    }
    this.rules = rules;

    this.states = Object.keys(rules).filter(a => a != "*");
    this.ruleCount = k;
  }

  getRule(state, h1, h2) {
    let rule = null;
    // If there are rules for the given state we will look at those rules
    if (state in this.rules) {
      rule = this.rules[state]
    // Otherwise if there is state wild card rules look at them
    } else if ("*" in this.rules) {
      rule = this.rules["*"]
    // No rule!
    } else {
      return null;
    }

    // If there is rules for head value 1
    if (h1 in rule) {
      rule = rule[h1];
    // Otherwise if there are rules for the wild card head value 1
    } else if ("*" in rule) {
      rule = rule["*"];
    // No rule!
    } else {
      return null;
    }

    // If there is a rule for head value 2
    if (h2 in rule) {
      rule = rule[h2];

    // Otherwise if there are rules for the wild card head value 2
    } else if ("*" in rule) {
      rule = rule["*"];
    } else {
      rule = null;
    }

    return rule;
  }
}



function isHalt(s){
  return !!s.match("halt");
}
function isAccept(s){
  return !!s.match("halt-accept");
}


/* Simulate, given a turing machine as a string and input string returns
   an itterate that simulates each step of the simulation.
   The itterater will return an array containing the state space, i.e. state
   and both tapes, itteration count, whether the input has been accepted or
   rejected and a boolean of wheather the simulation is still running.
*/
export function simulate(tm, str, str2 = "_"){
  if (str2 == "" || str2.length == 0) str2 = "_"
  if (str == "" || str.length == 0) str = "_"
  // Create the two tapes
  let tape1 = new Tape(str);
  let tape2 = new Tape(str2);
  // Create the TM2T object
  tm = new TM2T(tm);
  let state = tm.start;
  let i = -1;

  // Create an iterator for the simulation
  let next = () => {
    // First itteration just shows initial state
    if (i == -1) {
      i++;
      return [[state, tape1, tape2], i, false, true]
    }

    // get the move from the rules given the current state and head values
    let rule = tm.getRule(state, tape1.value, tape2.value);

    // If rule exists then move both tapes
    if (rule) {
      let {write1, write2, move1, move2, newstate} = rule;
      tape1.move(write1, move1);
      tape2.move(write2, move2);
      state = newstate;
    // Otherwise halt
    } else {
      state = "halt"
    }
    i++;

    return [[state, tape1, tape2], i, isAccept(state), !isHalt(state)];
  }

  next.tm = tm;

  return next;
}
