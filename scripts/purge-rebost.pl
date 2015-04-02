#!/usr/bin/env perl
use warnings;
use Config::JSON;
use 5.010;

# This script purges Rebost by editing involved template. Kinda of a hack.
use MediaWiki::API;

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

# Gotta get 'em all!
my $template = "Template:Fitxa_info";
my $edit_summary = "Refresh";

refreshPage( $template );

$mw->list ( { action => 'query',
              cmnamespace => 14, #Category namespace
              cmlimit=>'max' },
            { max => 100, hook => \&process_category } )
|| die $mw->{error}->{code} . ': ' . $mw->{error}->{details};

# process rebost categories
sub process_category {
    my ($ref) = @_;
    foreach (@$ref) {
        if ( $_->{title} =~/Rebost/ ) {
            refreshPage( $_->{title} );
        }
    }
}


sub refreshPage {
    
    my $page = shift;
    
    my $ref = $mw->get_page( { title => $pagename } );
    unless ( $ref->{missing} ) {
        my $timestamp = $ref->{timestamp};
        $mw->edit( {
            action => 'edit',
            title => $pagename,
            summary => $edit_summary,
            basetimestamp => $timestamp, # to avoid edit conflicts
            text => $ref->{'*'} } )
        || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};
    }

}



