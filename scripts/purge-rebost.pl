#!/usr/bin/env perl
use warnings;
use Config::JSON;
use 5.010;

# This script purges Rebost by editing involved template. Kinda of a hack.

use MediaWiki::Bot;

my $ns = shift;

my $config = Config::JSON->new("config.json");

# Username and password.
my $user = $config->get("username") // "";
my $pass = $config->get("password") // "";
my $host = $config->get("host") // "www.softcatala.org";
my $protocol = $config->get("protocol") // "https";

#Create a Perlwikipedia object
        my $editor = MediaWiki::Bot->new({
        host        => $host,
        login_data  => { username => $user, password => $pass },
});

# Gotta get 'em all!
my $template = "Template:Fitxa_info";
my $templateText = $editor->get_text( $template );


if ( $template ne '') {

	$editor->edit({
		page    => $template,
		text    => $templateText,
		summary => 'Purge'
	});

} 



