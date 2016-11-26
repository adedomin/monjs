MonJS
=====

init
----

    # will create the default configuration file.
    monjs init 

    # will start the application
    monjs start

    # launch into background
    monjs start > monjs.log & disown

Make sure to edit the configuration file before use; the init command will indicate where it was saved.

Using
-----

By default, the config has it listen on port 9001.

When hitting the index page, you sohuld be prompted for you api key, which was set in the config.

Hosts
-----

Hosts are just simple documents with a alias (hostname), an address (your.domain.tld or some ip) and extra variables (you can put extra information your services can use to check the health of your host).

    # example host
    # note that extra_vars should be lowercase only
    {
        "name": "alias",
        "address": "your.domain.tld",
        "extra_vars": {
            "service_pass": "some secret"        
        }
    }

Variables in a host can be accessed via the "args" of a service.
To access them, use \$VAR\$ or \$\_VAR\$ for extra_vars:

    $NAME$          - is replaced by the host's alias name
    $ADDRESS$       - is replaced by the address of the host
    $_SERVICE_PASS$ - gets the service_pass variable in extra_vars
