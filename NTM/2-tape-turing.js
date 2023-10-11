import {Tape} from "../tape.js"
export class TM2T{
  constructor(text) {
    let rules = {}
    let lines = text.replace(/;.*(?=\n)|^\s*/gm, "").split(/\n/);
    let start = null;
    let i =0;
    for (let line of lines) {
      if (!(line == "" || !!line.match(/^\s*$/))) {
        let vals = line.split(/\s+/);
        if (vals.length != 8) throw 'invalid number of parameters on line ' + i;
        let [state0, rh1, rh2, wh1, wh2, mv1, mv2, state1] = vals;
        if (start == null) start = state0;
        if (!(state0 in rules)) rules[state0] = {};
        if (!(rh1 in rules[state0])) rules[state0][rh1] = {};

        rules[state0][rh1][rh2] = {write1: wh1, write2: wh2, move1: mv1, move2: mv2, newstate: state1}
      }
      i++;
    }
    this.start = start;
    this.rules = rules;
  }

  getRule(state, h1, h2) {
    let rule = null;
    if (state in this.rules) {
      rule = this.rules[state]
    } else if ("*" in this.rules) {
      rule = this.rules["*"]
    } else {
      return null;
    }

    if (h1 in rule) {
      rule = rule[h1];
    } else  if ("*" in rule) {
      rule = rule["*"];
    } else {
      return null;
    }

    if (h2 in rule) {
      rule = rule[h2];
    } else if ("*" in rule) {
      rule = rule["*"];
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

export function simulate(tm, str){
  let tape1 = new Tape(str);
  let tape2 = new Tape("_");
  tm = new TM2T(tm);
  let state = tm.start;
  let i = -1;

  let next = () => {
    if (i == -1) {
      i++;
      return [[state, tape1, tape2], i, false, true]
    }

    let rule = tm.getRule(state, tape1.value, tape2.value);
    if (rule) {
      let {write1, write2, move1, move2, newstate} = rule;
      tape1.move(write1, move1);
      tape2.move(write2, move2);
      state = newstate;
    } else {
      state = "halt"
    }
    i++;

    return [[state, tape1, tape2], i, isAccept(state), !isHalt(state)];
  }
  return next;
}
