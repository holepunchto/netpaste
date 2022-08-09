import DHT from '@hyperswarm/dht'
import sodium from 'sodium-native'
import b4a from 'b4a'

export function seed () {
  const out = b4a.alloc(32)
  sodium.randombytes_buf(out)
  return out
}

export async function copy (seed, msg, opts = {}) {
  const node = opts.node || new DHT(opts)

  const keys = generateKeys(seed)

  const latest = await node.mutableGet(keys.sign.publicKey)
  const seq = latest ? latest.seq + 1 : 0

  const m = b4a.from(msg)
  const c = b4a.allocUnsafe(m.byteLength + sodium.crypto_box_SEALBYTES)

  sodium.crypto_box_seal(c, m, keys.box.publicKey)

  await node.mutablePut(keys.sign, c, { seq })
}

export function clear (seed, opts) {
  return copy(b4a.alloc(0), opts)
}

export async function paste (seed, opts = {}) {
  const node = opts.node || new DHT(opts)

  const keys = generateKeys(seed)

  const latest = await node.mutableGet(keys.sign.publicKey)
  if (!latest) return null

  const m = b4a.allocUnsafe(latest.value.byteLength - sodium.crypto_box_SEALBYTES)
  if (!sodium.crypto_box_seal_open(m, latest.value, keys.box.publicKey, keys.box.secretKey)) {
    return null
  }

  return m
}

function generateKeys (seed) {
  const out = b4a.alloc(32 + 32 + 64 + 32 + 32 + 32)
  const signSeed = out.subarray(0, 32)
  const boxSeed = out.subarray(32, 64)

  sodium.crypto_generichash(signSeed, b4a.from('sign'), seed)
  sodium.crypto_generichash(boxSeed, b4a.from('box'), seed)

  const sign = {
    secretKey: out.subarray(64, 128),
    publicKey: out.subarray(128, 160)
  }

  const box = {
    secretKey: out.subarray(160, 192),
    publicKey: out.subarray(192, 224)
  }

  sodium.crypto_sign_seed_keypair(sign.publicKey, sign.secretKey, signSeed)
  sodium.crypto_box_seed_keypair(box.publicKey, box.secretKey, boxSeed)

  return { sign, box }
}
