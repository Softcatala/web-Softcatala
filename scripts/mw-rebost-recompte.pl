#!/usr/bin/perl -w
use strict;

use utf8;
use Encode;
use URI::Escape;
use Data::Dumper;
use JSON -support_by_pp;
use MediaWiki::API;

use Config::JSON;
use 5.010;

my $mirror = shift // 0;

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

my %cmirror;
$cmirror{'15'} = "Catalanitzador";
$cmirror{'18'} = "Web del Catalanitzador";

my @mesosany = ('Tot l\'any', 'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre');

# Let's initialize bot

my $mw = MediaWiki::API->new( { api_url =>  $protocol."://".$host."/".$path."/api.php" }  );

#log in to the wiki
$mw->login( {lgname => $user, lgpassword => $pass } )
  || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};
  

my $dirpath = "/var/recomptes";

opendir (DIR, $dirpath) || die "Cannot open dir!";

my @months;
if ($mirror >0) {@months = grep /^20.*\-$mirror/, readdir (DIR);}
else {@months = grep /^20\d+\-\d+\./, readdir (DIR); }


closedir(DIR);

my %years;

foreach my $month (@months) {

	my ($year, $mes) = $month =~ /^(\d{4})\-(\S+)$/;
	push(@{$years{$year}}, $month);
}

foreach my $year (sort keys %years) {

	print "Entering $year\n";

	my $page = "Projectes/Rebost/$year";
	if (defined($mirror) && $mirror=~/^\d+/) {$page = "Projectes/Rebost/$year/$cmirror{$mirror}";}

	print STDERR $page, "\n";
	my $tables = "";
	my $edit_summary = "Actualitza $year";

	#Primer tot
	my $all = $year."-all.txt";
	if (defined($mirror) && $mirror=~/^\d+/ && $mirror > 0 ) { $all = $year."-all-".$mirror.".txt"; }
	$tables.= &process_tables($all);

	#Despres cada mes
	foreach my $mes (sort @{$years{$year}}) {
		$tables.= &process_tables($mes);
	}

	print "Now adding page for $year\n";
	editPage( $page, $tables, $edit_summary );

}

sub process_tables {

	my $mesfile = shift;
	my $output;

	open (READ, "$dirpath/$mesfile") || die "Cannot open $mesfile!";

	print STDERR $mesfile, "\n";

	my ($infomes) = $mesfile =~ /\-(\S+)\.txt/;
	if (defined($mirror) &&  $mirror=~/^\d+/ && $mirror > 0 ) {($infomes) = $mesfile =~ /\-(\S+)\-$mirror\.txt/;}

	if ($infomes eq 'all') {
		$output.= "== Tot l'any ==\n";
	}

	else {
		$output.= "== $mesosany[$infomes] ==\n";
	}

	$output.= "
	{| class='wikitable' border='1' cellpadding='3' cellspacing='1' align='center'
	|- 
	! style='background:#cccccc;' | Fitxa
	! style='background:#cccccc;' | Baixades
	|-
	";

	while (<READ>) {

		my ($prog, $down) = $_=~/^\s*(\S+)\t(\d+)\s*$/;

		if (!utf8::is_utf8($prog)) {
  		      utf8::decode($prog);
		}

		my $nom = $prog;
		$nom =~ s/\_/ /g;
		
		$output.= "|-
			| [[Rebost:$prog|$nom]]
			| $down
			";
	}

	close (READ);

	$output.= "|}\n";	
	return($output);

}


sub editPage {
    
    my $pagename = shift;
    my $text = shift;
    my $edit_summary = shift;
    
    my $ref = $mw->get_page( { title => $pagename } );
    unless ( $ref->{missing} ) {
        my $timestamp = $ref->{timestamp};
        $mw->edit( {
            action => 'edit',
            title => $pagename,
            summary => $edit_summary,
            basetimestamp => $timestamp, # to avoid edit conflicts
            text => $text } )
        || die $mw->{error}->{code} . ': ' . $mw->{error}->{details};
    }

}


