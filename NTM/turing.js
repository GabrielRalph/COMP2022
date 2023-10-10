
export class Tape{
  constructor(text){
    if (text) {
      let nodes = [...text].map((a) => {return {val: a, next: null, last: null}});
      let n = nodes.length;
      for (let i = 0; i < n; i++) {
        nodes[i].ref = i;
        let last = i-1;
        let next = i+1;
        if (last >= 0) {
          nodes[i].last = last;
        }
        if (next < n) {
          nodes[i].next = next;
        }
      }
      this.nodes = nodes;
      this.head = nodes[0];
    }
  }

  get value(){
    return this.head.val;
  }
  set value(val){
    this.head.val = val;
  }

  next(){
    let next = this.head.next;
    if (next == null) {
      let ref = this.nodes.length;
      next = {val: "_", next: null, last: this.head.ref, ref: ref};
      this.nodes.push(next);
      this.head.next = ref;
    }else {
      next = this.nodes[next];
    }
    this.head = next;
    return this.value;
  }
  last(){
    let last = this.head.last;
    if (last == null) {
      let ref = this.nodes.length;
      last = {val: "_", last: null, next: this.head.ref, ref: ref};
      this.nodes.push(last);
      this.head.last = ref;
    } else {
      last = this.nodes[last];
    }
    this.head = last;
    return this.value;
  }

  move(write, dir){
    if (write != "*") {
      this.value = write;
    }

    if (dir.toUpperCase() == "L") {
      this.last();
    } else if (dir.toUpperCase() == "R") {
      this.next();
    }
  }

  get start(){
    let n0 = this.nodes[0];
    while (n0.last != null) {
      n0 = this.nodes[n0.last];
    }
    return n0;
  }

  toString(){
    let n0 = this.start;
    let str = "";
    while (n0 != null) {
      str += n0.val;
      n0 = n0.next;
      if (n0 != null) n0 = this.nodes[n0];
    }
    return str;
  }

  clone(){
    let nnodes = this.nodes.map(n => {return {val: n.val, last: n.last, next: n.next, ref: n.ref}})
    let head = nnodes[this.head.ref];
    let clone = new Tape();
    clone.head = head;
    clone.nodes = nnodes;
    return clone;
  }

  getHtml(state){
    let n0 = this.nodes[0];
    let nodes = ""
    let i = 0;
    let val = (n) => n.val == "_" ? " " : n.val;
    while (n0 != null) {
      let head = n0.ref == this.head.ref ? "head" : ""
      nodes += `<div ${head} class = "t-cell" style = "--x: ${i}">${val(n0)}</div>`
      n0 = n0.last;
      if (n0 != null) {
        n0 = this.nodes[n0];
      }
      i--;
    }

    i = 1;
    n0 = this.nodes[0];
    while (n0.next != null) {
      n0 = this.nodes[n0.next];
      let head = n0.ref == this.head.ref ? "head" : ""
      nodes += `<div ${head} class = "t-cell" style = "--x: ${i}">${val(n0)}</div>`
      i++
    }
    return `  <div class = "tape" state = "${state}">
                <div class = "tape-state">${state}</div>
                <div class = "tape-ref-pos">
                  <div class = "tape-ref">
                    ${nodes}
                  </div>
                </div>
              </div>`
  }

  log(pre){
    let n0 = this.start;
    let before = "";
    let head = "";
    let after = "";
    let state = 0;
    while (n0 != null) {
      if (n0.ref == this.head.ref) {
        head = `%c${n0.val}`;
        state = 1;
      } else if (state == 0) {
        before += n0.val;
      } else if (state == 1) {
        after += n0.val;
      }

      n0 = n0.next;
      if (n0 != null) n0 = this.nodes[n0];
    }

    console.log(`${pre? pre + ": ": ""}%c${before}${head}%c${after}`, "color: white", "color: red", "color: white");
  }
}

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
      if (headvalue != "_") {
        if ("*" in this.rules[state]) {
          rules = [...rules, ...this.rules[state]["*"]];
        }
      }
      if (headvalue in this.rules[state]) {
        rules = [...rules, ...this.rules[state][headvalue]];
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
