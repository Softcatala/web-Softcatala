#!/usr/bin/env perl
use warnings;
use strict;
use HTML::TreeBuilder::XPath;
use LWP::UserAgent;
use utf8;
use Encode;
use Encode::Guess;
use Data::Dumper;
use JSON -support_by_pp;
use MediaWiki::API;

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

binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";

# Let's initialize bot

my $mw = MediaWiki::API->new( { api_url =>  $protocol."://".$host."/".$path."/api.php" }  );

#log in to the wiki
$mw->login( {lgname => $user, lgpassword => $pass } )
  || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};

# This script assumes all OS versions will be the same. Sometimes not been the case. Al loro!

my %product;
#http://baixades.softcatala.org/?url=http%3A%2F%2Fdownload.mozilla.org%2F%3Fproduct%3Dfirefox-3.6%26os%3Dlinux%26lang%3Dca&id=3522&mirall=mozilla&extern=1rediris&versio=3.6&so=linux
#params: id (from text file), url, mirall, extern, versio, so

$product{'firefox'}{'version'} = '3.6';
$product{'firefox'}{'name'} = 'Firefox';
$product{'firefox'}{'url'} = 'http://download.mozilla.org/?lang=ca';
@{$product{'firefox'}{'os'}} = ('windows', 'osx', 'linux');
$product{'firefox'}{'source'} = 'json';
$product{'firefox'}{'json'} = 'http://www.mozilla.com/includes/product-details/json/firefox_versions.json';
$product{'firefox'}{'stable'} = 'LATEST_FIREFOX_VERSION';
$product{'firefox'}{'rebost'} = $product{'firefox'}{'name'};

$product{'firefox_langpack'}{'version'} = '3.6';
$product{'firefox_langpack'}{'name'} = 'Firefox';
$product{'firefox_langpack'}{'url'} = 'http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/';
@{$product{'firefox_langpack'}{'os'}} = ('win32', 'mac', 'linux-i686');
$product{'firefox_langpack'}{'source'} = 'json_langpack';
$product{'firefox_langpack'}{'json'} = 'http://www.mozilla.com/includes/product-details/json/firefox_versions.json';
$product{'firefox_langpack'}{'stable'} = 'LATEST_FIREFOX_VERSION';
$product{'firefox_langpack'}{'rebost'} = "Paquet català per al Firefox";


$product{'fennec'}{'version'} = '17.0';
$product{'fennec'}{'name'} = 'Mobile';
$product{'fennec'}{'url'} = 'http://download.mozilla.org/?lang=ca';
@{$product{'fennec'}{'os'}} = ('android');
$product{'fennec'}{'source'} = 'json_and';
$product{'fennec'}{'json'} = 'http://www.mozilla.org/includes/product-details/json/mobile_details.json';
$product{'fennec'}{'stable'} = 'version';
$product{'fennec'}{'rebost'} = 'Firefox per a mòbils';

$product{'thunderbird'}{'version'} = '3.0.2';
$product{'thunderbird'}{'name'} = 'Thunderbird';
$product{'thunderbird'}{'url'} = 'http://download.mozilla.org/?lang=ca';
@{$product{'thunderbird'}{'os'}} = ('windows', 'osx', 'linux');
$product{'thunderbird'}{'source'} = 'json';
$product{'thunderbird'}{'json'} = 'http://www.mozilla.org/includes/product-details/json/thunderbird_versions.json';
$product{'thunderbird'}{'stable'} = 'LATEST_THUNDERBIRD_VERSION';
$product{'thunderbird'}{'rebost'} = $product{'thunderbird'}{'name'};

$product{'thunderbird_langpack'}{'version'} = '3.1';
$product{'thunderbird_langpack'}{'name'} = 'Thunderbird';
$product{'thunderbird_langpack'}{'url'} = 'http://ftp.mozilla.org/pub/mozilla.org/thunderbird/releases/';
@{$product{'thunderbird_langpack'}{'os'}} = ('win32', 'mac', 'linux-i686');
$product{'thunderbird_langpack'}{'source'} = 'json_langpack';
$product{'thunderbird_langpack'}{'json'} = 'http://www.mozilla.org/includes/product-details/json/thunderbird_versions.json';
$product{'thunderbird_langpack'}{'stable'} = 'LATEST_THUNDERBIRD_VERSION';
$product{'thunderbird_langpack'}{'rebost'} = "Paquet català per al Thunderbird";

$product{'seamonkey'}{'version'} = '2.0.3';
$product{'seamonkey'}{'name'} = 'SeaMonkey';
$product{'seamonkey'}{'url'} = 'http://download.mozilla.org/?lang=ca';
@{$product{'seamonkey'}{'os'}} = ('windows', 'osx', 'linux');
$product{'seamonkey'}{'source'} = 'json';
$product{'seamonkey'}{'json'} = 'http://www.seamonkey-project.org/seamonkey_versions.json';
$product{'seamonkey'}{'stable'} = 'LATEST_SEAMONKEY_VERSION';
$product{'seamonkey'}{'rebost'} = $product{'seamonkey'}{'name'};


$product{'seamonkey_langpack'}{'version'} = '2.0.3';
$product{'seamonkey_langpack'}{'name'} = 'SeaMonkey';
$product{'seamonkey_langpack'}{'url'} = 'http://ftp.mozilla.org/pub/mozilla.org/seamonkey/releases/';
@{$product{'seamonkey_langpack'}{'os'}} = ('win32', 'mac', 'linux-i686');
$product{'seamonkey_langpack'}{'source'} = 'json_langpack';
$product{'seamonkey_langpack'}{'json'} = 'http://www.seamonkey-project.org/seamonkey_versions.json';
$product{'seamonkey_langpack'}{'stable'} = 'LATEST_SEAMONKEY_VERSION';
$product{'seamonkey_langpack'}{'rebost'} = "Paquet català per al SeaMonkey";


my %param;
my %name;

$param{'mozilla'}{'windows'} = 'win';
$param{'mozilla'}{'osx'} = 'osx';
$param{'mozilla'}{'linux'} = 'linux';


my @list = ('firefox', 'thunderbird', 'seamonkey', 'thunderbird_langpack', 'seamonkey_langpack', 'fennec');

foreach my $app (@list) {
    
    #Retrieve
    if ($product{$app}{'source'} eq 'json') {
        
        my @lurl = ();
        
        $product{$app}{'version'} = &process_version_json($product{$app}{'json'}, $product{$app}{'stable'});
                
        foreach my $os (@{$product{$app}{'os'}}) {
            
            my $urlstring = 'http://download.mozilla.org/?product='.$app.'-'.$product{$app}{'version'}.'&os='.$param{'mozilla'}{$os}.'&lang=ca';

            push(@lurl, $urlstring);
        }
        send2wiki(\@lurl, $product{$app}{'version'}, $product{$app}{'rebost'});

    } 
    elsif ($product{$app}{'source'} eq 'json_and') {
        
        my @lurl = ();
        
        $product{$app}{'version'} = &process_version_json($product{$app}{'json'}, $product{$app}{'stable'});
                
        foreach my $os (@{$product{$app}{'os'}}) {
            
          #  my $urlstring = 'http://ftp.mozilla.org/pub/mozilla.org/'.lc($product{$app}{'name'}).'/releases/'.$product{$app}{'version'}.'/'.$os.'/ca/fennec-'.$product{$app}{'version'}.'.ca.android-arm.apk';
	  my $urlstring = 'https://play.google.com/store/apps/details?id=org.mozilla.firefox';

            push(@lurl, $urlstring);
        }
        send2wiki(\@lurl, $product{$app}{'version'}, $product{$app}{'rebost'});

    }
    
    #Retrieve
    else  {
        
        my @lurl = ();
        
        $product{$app}{'version'} = &process_version_json($product{$app}{'json'}, $product{$app}{'stable'});
                
            foreach my $os (@{$product{$app}{'os'}}) {
                
                my $urlstring ="";
                
                if ($product{$app}{'name'} eq 'SeaMonkey') {
                
                    $urlstring = 'http://ftp.mozilla.org/pub/mozilla.org/'.lc($product{$app}{'name'}).'/releases/'.$product{$app}{'version'}.'/langpack/'.lc($product{$app}{'name'}).'-'.$product{$app}{'version'}.'.ca.langpack.xpi';          
                }
                
                else {
                    
                    $urlstring = 'http://ftp.mozilla.org/pub/mozilla.org/'.lc($product{$app}{'name'}).'/releases/'.$product{$app}{'version'}.'/'.$os.'/xpi/ca.xpi';          
                }
        
                 
                push(@lurl, $urlstring);
            }
        
        send2wiki(\@lurl, $product{$app}{'version'}, $product{$app}{'rebost'});
    }
}

sub send2wiki {
    
    my $list = shift;
    my $version = shift;
    my $nomrebost = shift;
    
    my $page = $mw->get_page( { title => 'Rebost:'.$nomrebost } );
    my $wikitext = $page->{'*'};
    my @wikilines = split(/\n/, $wikitext);

    my %platforms = ('os=win', $$list[0], 'os=osx', $$list[1], 'os=linux', $$list[2], '\/win32\/', $$list[0], '\/mac\/', $$list[1], '\/linux-i686\/', $$list[2], '\/android\/', $$list[0]);
    my @platkeys = keys (%platforms);
    
    my $wikitext2;

    foreach my $wikiline (@wikilines) {
        
        if ($wikiline=~/^\s*\|Versi\S+\s*\=/) {
            
            $wikiline = "|Versió=$version";
            
        }
        
        else {
            foreach my $platkey (@platkeys) {
                
                if ($wikiline=~/$platkey/) {
                    $wikiline = "|URL programa=$platforms{$platkey}";
                }
            } 
        }
        
        $wikitext2 .= $wikiline. "\n";
    }

    my $enc = guess_encoding($wikitext2);
    my $utf8 = "";
    if(ref($enc)) {
    
            if ($enc->name eq 'utf8') {
                $utf8 = $wikitext2;
        
            }
            else {
                
                $utf8 = $wikitext2;   
                
            }
        }
    

    #print $wikitext2
    my $nompage="Rebost:".$nomrebost;
    my $edit_summary = "Actualitzat a darrera versió";
    
    if ($utf8 ne '') {
        
        my $ref = $mw->get_page( { title => $nompage } );
        unless ( $ref->{missing} ) {
            my $timestamp = $ref->{timestamp};
            $mw->edit( {
                action => 'edit',
                title => $nompage,
                summary => $edit_summary,
                basetimestamp => $timestamp, # to avoid edit conflicts
                text => $utf8 } )
            || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};
        }
    }
}

sub process_version_json() {
    
    my ($url, $stage) = @_;
    
    my $ua = LWP::UserAgent->new( agent => 'Mozillacat v0.1' );
    $ua->default_header(
    'Accept-Language' => 'ca',
    'Accept-Charset' => 'utf-8');
    
    my $content;
    
    my $resp = $ua->get($url);
    if ( $resp->is_success ) {
        $content = $resp->decoded_content((charset => 'utf-8'));
    } else {
        die "Problems retrieving : "+$resp->status_line ;
    }
    my $json = new JSON;
    # these are some nice json options to relax restrictions a bit:
    my $json_text = $json->allow_nonref->utf8->relaxed->escape_slash->loose->allow_singlequote->allow_barekey->decode($content);
    my $version = $json_text->{$stage};
    return($version);
}
