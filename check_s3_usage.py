#!/usr/bin/python

# Nagios check_s3_usage plugin
#
# License: GPL2 or above
# Copyright (c) 2007 Basil Shubin <bashu@users.sourceforge.net>
#
# Description:
#
# This plugin checks disk usage by S3 storage system.
#
# To use this plugin you must have s3cmd installed (http://s3tools.logix.cz)
#
# TODO:
#
# Add more functionality to this script
# HISTORY:
#   Ver 0.2 Israel E. Bethencourt <ieb@corecanarias.com>
#     Added settings argument to select non default s3cmd config directory.
#     Added warning and critical args
#     Prettify the usage size
#

"""check_s3_usage 0.1
Copyright (c) 2007 Basil Shubin <bashu@users.sourceforge.net>

This plugin checks the amount of used disk space on a S3 storage system and
generates an alert if free space is less than one of the threshold values.

To use this plugin you must have s3cmd installed (http://s3tools.logix.cz)

Usage: %(program)s [-b bucket] [-t timeout]

Options:
 -h, --help
    Print detailed help screen
 -V, --version
    Print version information
 -b, --bucket=URI
    Check specified S3 bucket by URI
 -t, --timeout=INTEGER
    Seconds before connection times out (default: 10)
"""

__version__ = '0.2'

import os
import sys
import getopt
import signal
import math
import string
from subprocess import Popen, PIPE

program = sys.argv[0]

COMMASPACE = ', '

STATE_OK = 0
STATE_WARNING = 1
STATE_CRITICAL = 2
STATE_UNKNOWN = 3
STATE_STR = ['OK', 'WARNING', 'CRITICAL', 'UNKNOWN']

OK = 0
ERROR = -1

# path to s3cmd executable
S3CMD = '/usr/bin/s3cmd'
DU = 'du'

class size( long ):
    """ define a size class to allow custom formatting
        format specifiers supported :
            em : formats the size as bits in IEC format i.e. 1024 bits (128 bytes) = 1Kib
            eM : formats the size as Bytes in IEC format i.e. 1024 bytes = 1KiB
            sm : formats the size as bits in SI format i.e. 1000 bits = 1kb
            sM : formats the size as bytes in SI format i.e. 1000 bytes = 1KB
            cm : format the size as bit in the common format i.e. 1024 bits (128 bytes) = 1Kb
            cM : format the size as bytes in the common format i.e. 1024 bytes = 1KB
    """
    def __format__(self, fmt):
        # is it an empty format or not a special format for the size class
        if fmt == "" or fmt[-2:].lower() not in ["em","sm","cm"]:
            if fmt[-1].lower() in ['b','c','d','o','x','n','e','f','g','%']:
                # Numeric format.
                return long(self).__format__(fmt)
            else:
                return str(self).__format__(fmt)

        # work out the scale, suffix and base
        factor, suffix = (8, "b") if fmt[-1] in string.lowercase else (1,"B")
        base = 1024 if fmt[-2] in ["e","c"] else 1000

        # Add the i for the IEC format
        suffix = "i"+ suffix if fmt[-2] == "e" else suffix

        mult = ["","K","M","G","T","P"]

        val = float(self) * factor
        i = 0 if val < 1 else int(math.log(val, base))+1
        v = val / math.pow(base,i)
        v,i = (v,i) if v > 0.5 else (v*base,i-1)

        # Identify if there is a width and extract it
        width = "" if fmt.find(".") == -1 else fmt[:fmt.index(".")]
        precis = fmt[:-2] if width == "" else fmt[fmt.index("."):-2]

        # do the precision bit first, so width/alignment works with the suffix
        t = ("{0:{1}f}"+mult[i]+suffix).format(v, precis)

        return "{0:{1}}".format(t,width) if width != "" else t

def usage(code, msg=''):
    outfp = sys.stderr
    if code == 0:
        outfp = sys.stdout

    print >> outfp, __doc__ % globals()
    if msg:
        print >> outfp, msg

    sys.exit(code)

def output(code, msg=''):
    outfp = sys.stdout
    if msg:
        print >> outfp, "S3", STATE_STR[code], msg
    sys.exit(code)

def parseargs():
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'b:t:w:c:s:Vh',
                                           ['bucket', "warning", "critical", "settings", 'timeout', 'version', 'help'])
    except getopt.error, msg:
        usage(OK, msg)

    class Options:
        bucket = None      # S3 bucket URI
        timeout = 10       # timeout for command
        warning = ''
        critical = ''
        settings = ''

    options = Options()

    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage(OK)
        elif opt in ('-v', '--version'):
            output(__version__, OK)
        elif opt in ('-b', '--bucket'):
            options.bucket = arg
        elif opt in ('-w', '--warning'):
            options.warning = int(arg)
        elif opt in ('-c', '--critical'):
            options.critical = int(arg)
        elif opt in ('-t', '--timeout'):
            options.timeout = int(arg)
        elif opt in ('-s', '--settings'):
            options.settings = "-c" + arg
        else:
            assert False, (opt, arg)

    if options.bucket is None:
        usage(ERROR, "No bucket URI specified!")

    # Any other arguments are invalid
    if args:
        usage(ERROR, 'Invalid arguments: ' + COMMASPACE.join(args))

    return options


def main():
    def handler(signum, frame):
        raise IOError
    options = parseargs()
    if options.bucket is not None:
        # Set the signal handler and an alarm set by timeout
        signal.signal(signal.SIGALRM, handler)
        signal.alarm(options.timeout)
        try:
            settings = ''
            if options.settings != '':
                settings = options.settings
            p1 = Popen([S3CMD, settings, DU, options.bucket], stdout=PIPE)
            out, err = p1.communicate()
            retcode = p1.wait()
        except:
            os.kill(p1.pid, signal.SIGTERM)
            output(STATE_CRITICAL,
                   "Command timeout after %s seconds!" % options.timeout)

        signal.alarm(0)

        if retcode == OK:
            if options.bucket is None:
                pass
            else:
                usage = int(out.split()[0])
                state = STATE_OK
                if isinstance(options.critical, int) and usage > options.critical:
                    state = STATE_CRITICAL;
                elif isinstance(options.warning, int) and usage > options.warning:
                    state = STATE_WARNING
                output(state,
                       "bucket usage: {0} {1:.2cM};| size={2};{3};{4};0;".format(options.bucket, size(usage), usage, options.warning, options.critical))
        else:
            output(STATE_UNKNOWN, "error")

if __name__ == '__main__':
    main()

