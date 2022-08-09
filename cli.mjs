#! /usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import minimist from 'minimist'
import b4a from 'b4a'

import { copy, paste, seed } from './lib/index.mjs'
import os from 'os'

const dir = path.join(os.homedir(), '.netpaste')

const helpString = `
netpaste

copy and paste over the dht

usage:

cat copy.txt | netpaste copy [opts]

netpaste paste [opts] > pasted.txt

options:
`

const command = process.argv[2]
const argv = minimist(process.argv.slice(3), {
  boolean: ['help'],
  string: ['profile'],
  alias: {
    profile: 'p'
  },
  default: {
    profile: 'default'
  }
})

if (argv.help || command === 'help') {
  console.log(helpString)
  process.exit(0)
}

let _seed

if (command === 'seed') {
  await store(seed(), argv.profile)
  process.exit(1)
}

if (argv.seed) {
  _seed = b4a.from(argv.seed, 'hex')
} else {
  _seed = await load(argv.profile)
}

const opts = getOpts(argv)

switch (command) {
  case 'copy':
    await copy(_seed, argv._[0], opts)
    break

  case 'paste': {
    const value = await paste(_seed, opts)
    process.stdout.write(value)
    break
  }

  case 'import': {
    const [profile, seed] = argv._

    if (!profile || !seed) {
      console.log('usage: netpaste import <profile> <seed>')
      process.exit(1)
    }

    await store(seed, profile)
    break
  }

  case 'export': {
    const profile = argv._.length ? argv._[0] : argv.profile
    if (argv._.length) _seed = await load(profile)

    console.log(profile + ':', _seed.toString('hex'))
    break
  }

  default:
    console.log(helpString)
    process.exit(1)
}

process.exit(0)

async function load (profile = 'default') {
  const file = path.join(dir, profile)
  const seed = await fs.readFile(file)

  return seed
}

async function store (seed, profile = 'default') {
  if (typeof seed === 'string') return store(b4a.from(seed, 'hex'), profile)

  await checkDir()

  const file = path.join(dir, profile)
  return fs.writeFile(file, seed)
}

async function checkDir () {
  try {
    await fs.access(dir)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return fs.mkdir(dir)
    }
  }
}

function getOpts (argv) {
  return {}
}
