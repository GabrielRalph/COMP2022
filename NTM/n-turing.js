import {Tape} from "../tape.js"
export class TM{
  constructor(text) {
    let rules = {}
    let lines = text.replace(/;.*(?=\n)|^\s*/gm, "").split(/\n/);
    let start = null;
    let i =0;
    for (let line of lines) {
      if (!(line == "" || !!line.match(/^\s*$/))) {
        let vals = line.split(/\s+/);
        if (vals.length != 5) throw 'invalid number of parameters on line ' + i;
        let [state0, rv, wv, dir, state1] = vals;
        if (start == null) start = state0;
        if (!(state0 in rules)) rules[state0] = {};
        if (!(rv in rules[state0])) rules[state0][rv] = [];
        rules[state0][rv].push({write: wv, move: dir, state: state1});
      }
      i++;
    }
    this.start = start;
    this.rules = rules;
  }

  getRules(state, headvalue) {
    let rules = [];
    if (state in this.rules) {
      if (headvalue in this.rules[state]) {
        rules = this.rules[state][headvalue];
      } else  if ("*" in this.rules[state]) {
        rules = this.rules[state]["*"];
      }


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

  return next;
}
