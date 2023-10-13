import {Tape} from "../tape.js"
export class TM{
  constructor(text) {
    // Rules will be a dictionary for which states are keys
    let rules = {}

    // Remove comments and leading whitespace
    let lines = text.replace(/;.*(?=\n)|^\s*/gm, "").split(/\n/);

    // For each non empty line in the tm text
    let i,k =0;
    for (let line of lines) {
      if (!(line == "" || !!line.match(/^\s*$/))) {

        // Split by whitespace characters and throw error if invalid number of
        // arguments
        let vals = line.split(/\s+/);
        if (vals.length != 5) throw 'invalid number of parameters on line ' + i;
        let [state0, rv, wv, dir, state1] = vals;
        if (!dir.match(/[*LRlr]/)) throw 'invalid move ' + line;

        // The first state written will be the starting state
        if (!this.start) this.start = state0;

        // The value in the rules for a given state is a dictionary
        // for which head values are the keys
        if (!(state0 in rules)) rules[state0] = {};
        // The value in rules for a state for a head value is an array of
        // possible consequent moves
        if (!(rv in rules[state0])) rules[state0][rv] = [];
        rules[state0][rv].push({write: wv, move: dir, state: state1});
        k++;
      }
      i++;
    }
    this.rules = rules;
    this.states = Object.keys(rules).filter(a => a != "*");
    this.ruleCount = k;
  }

  getRules(state, headvalue) {
    let rules = [];
    if (state in this.rules) {
      rules = this.rules[state];
    } else if ("*" in this.rules) {
      rules = this.rules["*"]
    } else {
      return [];
    }

    if (headvalue in rules) {
      rules = rules[headvalue];
    } else  if ("*" in rules) {
      rules = rules["*"];
    } else {
      return [];
    }

    return rules;
  }
}



function isHalt(s){
  return !!s.match("halt");
}
export function simulate(tm, str) {

  let m = new TM(tm);


  let i = -1;
  let ss = [[m.start, new Tape(str)]]
  let nh = 1;

  let next = () => {
    if (i == -1) {
      i++;
      return [ss, i, null, true]
    }
    let accept = null;
    if (nh > 0) {
      let nss = [];
      nh = 0;
      for (let [state, t] of ss) {
        if (!isHalt(state)) {
          let moves = m.getRules(state, t.value);
          if (moves.length == 0) {
            nss.push(["halt-reject", t])
          } else {
            for (let move of moves) {
              let t2 = t.clone();
              t2.move(move.write, move.move);
              nss.push([move.state, t2])
              if (!isHalt(move.state)) nh++;
            }
          }
        } else {
          nss.push([state, t])
        }
      }
      ss = nss;
      i++;
    }
    if (nh == 0) {
      accept = false;
    }
    for (let [state, t] of ss) {
      if (state.match("accept")) {
        accept = true;
      }
    }

    let cont = !((accept == true) || (nh == 0))

    return [ss, i, accept, cont];
  }
  next.tm = m;
  return next;
}
