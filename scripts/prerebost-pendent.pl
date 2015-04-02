#!/usr/bin/env perl
use warnings;
use strict;

use MediaWiki::API;
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
my $config_json = shift // "config.json";

my $config = Config::JSON->new( $config_json );

# Username and password.
my $user = $config->get("mw/username") // "";
my $pass = $config->get("mw/password") // "";
my $host = $config->get("mw/host") // "www.softcatala.org";
my $protocol = $config->get("mw/protocol") // "https";
my $path = $config->get("mw/path") // "w";

# Let's initialize bot

my $mw = MediaWiki::API->new( { api_url =>  $protocol."://".$host."/".$path."/api.php" }  );

#log in to the wiki
$mw->login( {lgname => $user, lgpassword => $pass } )
  || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};


# get a list of articles in category
my $pages = $mw->list ( {
  action => 'query',
  list => 'categorymembers',
  cmtitle => 'Category:PreRebost',
  cmlimit => 'max' } )
  || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};

my $body = "Queda pendent al PreRebost:\n
https://www.softcatala.org/wiki/Categoria:PreRebost\n\n";

foreach my $page (@{$pages}) {

    my $title = $page->{title};
	#Espais
	$title=~s/\s/\_/g;
	$body.="https://www.softcatala.org/wiki/".$title."\n";

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
