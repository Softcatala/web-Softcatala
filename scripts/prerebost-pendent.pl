#!/usr/bin/env perl
use warnings;
use strict;

use MediaWiki::Bot;
use utf8;
use Encode;
use Carp;
use MIME::Lite;
use Net::SMTP;
use POSIX qw/strftime/;

my $stamp = strftime("%Y%m%d", localtime);

binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";

use Config::JSON;
use 5.010;

my $config = Config::JSON->new("config.json");

# Username and password.
my $user = $config->get("username") // "";
my $pass = $config->get("password") // "";
my $host = $config->get("host") // "www.softcatala.org";
my $protocol = $config->get("protocol") // "https";
my $path = $config->get("path") // "w";

#Create a Perlwikipedia object
my $editor = MediaWiki::Bot->new({
        host    => $host,
        debug   => 2,
        assert  => 'bot',
        protocol    => $protocol,
        path        => $path
});

$editor->login({
        username => $user,
        password => $pass,
}) or die "Login failed";


# Turn debugging on, to see what the bot is doing
$editor->{debug} = 1;

my @pages = $editor->get_pages_in_category('Category:PreRebost');

my $body = "Queda pendent al PreRebost:\n
https://www.softcatala.org/wiki/Categoria:PreRebost\n\n";

foreach my $page (@pages) {

	#Espais
	$page=~s/\s/\_/g;
	$body.="https://www.softcatala.org/wiki/".$page."\n";

}

my $from_mime = "rebost\@llistes.softcatala.org";
my $to = $from_mime;
my $subject = "[Pendent PreRebost] ".$stamp;

my $msg = MIME::Lite->new (
    From       => "$from_mime"                 ,
    To         => "$to"                        ,
    Subject    => "$subject"                   ,
    Type       => 'multipart/related',
    );

   $body = toutf8('latin1', $body);

    $msg->attach(
        Type     => 'text/plain; charset=UTF-8',
        Data     => $body,
        Encoding => 'quoted-printable',
    );

    $msg->send;


sub toutf8 {
#takes: $from_encoding, $text
#returns: $text in utf8
my $encoding = shift;
my $text = shift;
if ($encoding =~ /utf\-?8/i) {
return $text;
}
else {
return Encode::encode("utf8", Encode::decode($encoding, $text));
}
}
