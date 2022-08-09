# netpaste

Copy and paste over the DHT.

## Usage

```
# generate a seed
netpaate seed

# export default key
netpaste export
> default: abc..123

# import a key under test profile
netpaste import test 123..abc

# copy to default profile
netpaste copy 'hello, world!'

# paste from another profile
netpaste paste --profile test
> 'some other text...'
```

## API

#### `netpaste copy  <data>`

Copy data to the DHT.

#### `netpaste paste`

Paste data from the DHT.

#### `netpaste seed`

Generate a seed.

#### `netpaste import <profile> <key>`

Import a key to a given profile.

#### `netpaste export [profile]`

Export a key.

#### Options:

`--profile | -p`  -- specify a profile to use. defaults to `default`

Profile keys are stored to `~/.netpaste/<profile>`.
