export class Tape{
  /* Constructs doubly linked list with nodes stored in array where node referenes
     are to the indecies of the nodes in the array. Nodes will never be removed
     but knew nodes will be added.
  */
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

  // Get and set values of the head
  get value(){
    return this.head.val;
  }
  set value(val){
    this.head.val = val;
  }

  /* moves the head to the right if the head reaches the end of the linked list
     then a new node is created with the blank space character
  */
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

  /* moves the head to the left if the head reaches the end of the linked list
     then a new node is created with the blank space character
  */
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

  /* Move takes a value to write and a move direction, it then writes the head
     value and performs the given move. Moving left if the direction is 'L' and
     right if direction is 'R' otherwise the head will not move if direction is
     '*'. If '*' is given as the value to write the head will not write anything
     and just move.
  */
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

  /* Returns the leftmost node
  */
  get start(){
    let n0 = this.nodes[0];
    while (n0.last != null) {
      n0 = this.nodes[n0.last];
    }
    return n0;
  }

  // returns right most node
  get end(){
    let n0 = this.nodes[0];
    while (n0.next != null) {
      n0 = this.nodes[n0.next];
    }
    return n0;
  }

  /* Returns the tape as a string
  */
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

  /* Clones the tape and head location
  */
  clone(){
    let nnodes = this.nodes.map(n => {return {val: n.val, last: n.last, next: n.next, ref: n.ref}})
    let head = nnodes[this.head.ref];
    let clone = new Tape();
    clone.head = head;
    clone.nodes = nnodes;
    return clone;
  }

  /* Returns the tape as a HTML string, can take a state as parameters
     and adds that to the display
  */
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

  /* Console logs the tape using colors to show where the head is
  */
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

export class PortalTape extends Tape {
  /* Move takes a value to write and a move direction, it then writes the head
     value and performs the given move. Moving left if the direction is 'L' and
     right if direction is 'R' otherwise the head will not move if direction is
     '*'. If '*' is given as the value to write the head will not write anything
     and just move.
  */
  move(write, dir){
    dir = dir.toUpperCase();
    if (write != "*") {
      this.value = write;
    }
    if (write == "0" && dir != "*") {
      if (dir == "L") {
        this.move2leftmost0();
      } else if (dir == "R"){
        this.move2rightmost0();
      }
    } else {
      if (dir == "L") {
        this.last();
      } else if (dir == "R") {
        this.next();
      }
    }
  }

  clone(){
    let nnodes = this.nodes.map(n => {return {val: n.val, last: n.last, next: n.next, ref: n.ref}})
    let head = nnodes[this.head.ref];
    let clone = new PortalTape();
    clone.head = head;
    clone.nodes = nnodes;
    return clone;
  }

  move2leftmost0(){
    let n = this.head.last;
    while (n != null && this.nodes[n].val != "0") {
      n = this.nodes[n].last;
    }

    if (n == null) {
      n = this.end.ref;
      while (n != null && this.nodes[n].val != "0") {
        n = this.nodes[n].last;
      }
    }

    this.head = this.nodes[n];
  }

  move2rightmost0(){
    let n = this.head.next;
    while (n != null && this.nodes[n].val != "0") {
      n = this.nodes[n].next;
    }

    if (n == null) {
      n = this.start.ref;
      while (n != null && this.nodes[n].val != "0") {
        n = this.nodes[n].next;
      }
    }

    this.head = this.nodes[n];
  }
}

export class TMParseError extends Error{
  constructor(message, line) {
    super(message);
    this.line = line;
  }
}

export function strip(text) {
  text = text.replace(/;.*$/, "") // remove comments
  text = text.replace(/\s*$/, ""); // remove trailing whitespace
  text = text.replace(/^\s*/, ""); // remove leading whitespace
  return text;
}
