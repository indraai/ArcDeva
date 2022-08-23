// Copyright (c)2022 Quinn Michaels
// The Arcade Deva

const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const ARC = new Deva({
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      input = input.trim()
                .replace(/Kill/g, 'Tackle')
                .replace(/kill/g, 'tackle')
      return [
        '::begin:code',
        input.trim(),
        '::end:code',
      ].join('\n')
    }
  },
  vars,
  listeners: {
    'arc:relay'(packet) {
      if (!packet || !this.active) return;
      this.func.terminal(packet);
      return;
    },
  },
  modules: {},
  deva: {},
  func: {
    /**************
    func: open
    params: arc - the connection string to teh arc
    describe: open a connection to an arc through the telnet gateway.
    ***************/
    open(arc) {
      // this is where we initiate playing the game
      this.prompt('ARC OPEN....');
      return new Promise((resolve, reject) => {
        if (this.vars.arc) this.func.close();

        this.question(`#telnet open:${this.agent.key} ${arc} ${this.vars.arc.event}`).then(answer => {
          // insert the arc into the arcs history array.
          // set the deva variable arc to the new value.
          this.vars.arc.current = arc;
          return resolve({
            text: answer.a.text,
            html: answer.a.html,
            data: answer.a.data,
          });
        }).catch(err => {
          return this.error(err, arc, reject);
        });
      });
    },
    /**************
    func: write
    params: text - text to write to the arc server
    describe: write/post a message to the active arc server.
    ***************/
    write(text) {
      const id = this.uid();
      const orig = text;
      return new Promise((resolve, reject) => {
        this.question(`#telnet write:${this.agent.key} ${text}`).then(answer => {
          return resolve({
            text: answer.a.text,
            html: answer.a.html,
            data: answer.a.data,
          });
        }).catch(reject);
      });
    },

    /**************
    func: close
    params: none
    describe: close the arc connection
    ***************/
    close() {
      this.vars.arc.history.push({arc:this.vars.arc.current, date:Date.now()});
      this.vars.arc.current = false;
      return this.question(`#telnet close ${this.agent.key}`);
    },
    /**************
    func: terminal
    params: opts
    describe: send a response to the terminal for the arc deva.
    ***************/
    terminal(opts) {
      if (!opts) return;
      opts.a.text = this.agent.parse(opts.a.text);
      if (!opts.a.text) return;

      // opts.q = this.lib.copy(opts.a);
      this.question(`#feecting parse:${this.agent.key}:terminal ${opts.a.text}`).then(parsed => {
        opts.a = {
          agent: this.agent,
          client: this.client,
          meta: {
            key: this.agent.key,
            method: 'terminal',
            arc: this.vars.arc,
          },
          text: parsed.a.text,
          html: parsed.a.html,
          data: opts.a.data || parsed.a.data,
          created: Date.now(),
        }
        this.talk(`socket:terminal`, opts);
        this.prompt(parsed.a.text);
        return;
      }).catch(err => {
        this.error(err, opts);
      });
    },

  },
  methods: {
    /**************
    method: open
    params: packet.q.text
    describe: open a connection to an arc
    ***************/
    open(packet) {
      return this.func.open(packet.q.text);
    },

    /**************
    method: close
    params: packet.q.text
    describe: close a connection to an arc
    ***************/
    close(packet) {
      return this.func.close();
    },


    /**************
    method: > - write method
    params: packet.q.text
    describe: shorthand write method for arc functions
    ***************/
    '>'(packet) {
      return this.func.write(packet.q.text);
    },
    'write'(packet) {
      return this.func.write(packet.q.text);
    },

    'look'(packet) {
      return this.func.write(`look ${packet.q.text}`);
    },

    'put'(packet) {
      return this.func.write(`put ${packet.q.text}`);
    },

    'put'(packet) {
      return this.func.write(`put ${packet.q.text}`);
    },
    // touch something
    'touch'(packet) {
      return this.func.write(`touch ${packet.q.text}`);
    },
    // learn something
    'learn'(packet) {
      return this.func.write(`learn ${packet.q.text}`);
    },
    // abilities
    'ab'(packet) {
      return this.func.write(`abilities ${packet.q.text}`);
    },
    'drink'(packet) {
      return this.func.write(`eat ${packet.q.text}`);
    },

    uid(packet) {
      return Promise.resolve(this.uid());
    },
    status(packet) {
      return this.status();
    },
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    }
  },
});
module.exports = ARC
