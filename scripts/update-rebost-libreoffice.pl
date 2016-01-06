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

# Versions in: https://gent.softcatala.org/jmontane/libo/latest_files.txt

#220893184 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86/LibreOffice_5.0.4_Win_x86.msi
#245141504 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86_64/LibreOffice_5.0.4_Win_x64.msi
#201743847 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/mac/x86_64/LibreOffice_5.0.4_MacOS_x86-64.dmg
#7274496 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86/LibreOffice_5.0.4_Win_x86_helppack_ca-valencia.msi
#7270400 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86/LibreOffice_5.0.4_Win_x86_helppack_ca.msi
#7270400 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86_64/LibreOffice_5.0.4_Win_x64_helppack_ca-valencia.msi
#7266304 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/win/x86_64/LibreOffice_5.0.4_Win_x64_helppack_ca.msi
#8443725 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/mac/x86_64/LibreOffice_5.0.4_MacOS_x86-64_langpack_ca-valencia.dmg
#8428597 5.0.4 http://download.documentfoundation.org/libreoffice/stable/5.0.4/mac/x86_64/LibreOffice_5.0.4_MacOS_x86-64_langpack_ca.dmg

my @programs = (
	[ "LibreOffice", "Windows32" ],
	[ "LibreOffice", "Windows64" ],
	[ "LibreOffice", "OSX" ],
	[ "Paquet_d'ajuda_en_català_(valencià)_del_LibreOffice", "Windows32" ],
	[ "Paquet_d'ajuda_en_català_del_LibreOffice", "Windows32" ],
	[ "Paquet_d'ajuda_en_català_(valencià)_del_LibreOffice", "Windows64" ],
	[ "Paquet_d'ajuda_en_català_del_LibreOffice", "Windows64" ],
	[ "Paquet_català_(valencià)_per_al_LibreOffice", "OSX" ],
	[ "Paquet_català_per_al_LibreOffice", "OSX" ]
);

@programs = process_version_text("https://gent.softcatala.org/jmontane/libo/latest_files.txt", \@programs);

print Dumper( \@programs );

# TODO: Send 2 wiki then

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

sub process_version_text() {
    
    my ($url, $programs) = @_;
    
    my $ua = LWP::UserAgent->new( agent => 'LibObot v0.1' );
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

	if ( $content eq '' ) {
		die "No content!";
	}
	
	my @lines = split( /\n/, $content );
	my $iter = 0;
	foreach my $line ( @lines ) {
		
		chomp( $line );
		my @elems = split( /\s+/, $line );
				
		push( @{$programs[$iter]}, @elems );
		
		$iter++;
	}
	
	
	return @{$programs};
	
}
