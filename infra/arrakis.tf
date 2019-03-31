# SPDX-License-Identifier: CC0-1.0
variable "cloudflare_email" {}
variable "cloudflare_token" {}

provider "cloudflare" {
  version = "~> 1.12"
  email = "${var.cloudflare_email}"
  token = "${var.cloudflare_token}"
}

# Enable HSTS and always redirect to https
resource "cloudflare_zone_settings_override" "arrakis" {
  name = "arrak.is"
  settings = {
    always_use_https = "on"
    security_header = {
      enabled = true
      include_subdomains = true
    }
  }
}

################################################################################
# Site

# Apex domain (Cloudflare supports CNAME flattening)
resource "cloudflare_record" "netlify-apex" {
  domain  = "arrak.is"
  type    = "CNAME"
  name    = "arrak.is."
  value   = "arrakis.netlify.com"
  proxied = true
}

# www subdomain
resource "cloudflare_record" "netlify-www" {
  domain  = "arrak.is"
  type    = "CNAME"
  name    = "www.arrak.is."
  value   = "arrakis.netlify.com"
  proxied = true
}

# Forward www subdomain to apex domain
resource "cloudflare_page_rule" "www-to-apex" {
  zone   = "arrak.is"
  target = "www.arrak.is/*"

  actions = {
    forwarding_url = {
      url = "https://arrak.is/$1"
      status_code = 301
    }
  }
}

################################################################################
# Mail

# mail subdomain
# https://www.zoho.com/mail/help/adminconsole/organization-dashboard.html
resource "cloudflare_record" "zoho" {
  domain  = "arrak.is"
  type    = "CNAME"
  name    = "mail.arrak.is."
  value   = "business.zoho.com"
  proxied = true
}

# MX records
# https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html
resource "cloudflare_record" "zoho-mx1" {
  domain   = "arrak.is"
  type     = "MX"
  name     = "@"
  value    = "mx.zoho.com"
  priority = 10
}

resource "cloudflare_record" "zoho-mx2" {
  domain   = "arrak.is"
  type     = "MX"
  name     = "@"
  value    = "mx2.zoho.com"
  priority = 20
}

resource "cloudflare_record" "zoho-mx3" {
  domain   = "arrak.is"
  type     = "MX"
  name     = "@"
  value    = "mx3.zoho.com"
  priority = 50
}

# Sender Policy Framework
# https://www.zoho.com/mail/help/adminconsole/spf-configuration.html
resource "cloudflare_record" "zoho-spf" {
  domain = "arrak.is"
  type   = "TXT"
  name   = "@"
  value  = "v=spf1 include:zoho.com ~all"
}

# DomainKeys Identified Mail
# https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html
resource "cloudflare_record" "zoho-dkim" {
  domain = "arrak.is"
  type   = "TXT"
  name   = "dj._domainkey.arrak.is."
  value  = "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeF7sFNI6kH4AY5cXTXq4d41tqbeXSw0Kl4Q4m9nN7W+MU2fH4HirTsPW9bTF+S4O7XvoAkG1hEJj0wrxjPN9bUnA490L49KYC04YxH41gHeVz5xve/miGj7R8Q//sZnqKOUXp1qHdVdWdgUWr61A55qNLLW0a6J5nCuH+iB8fGwIDAQAB"
}

################################################################################
# Keybase DNS proof

resource "cloudflare_record" "keybase" {
  domain = "arrak.is"
  type   = "TXT"
  name   = "@"
  value  = "keybase-site-verification=Ii4wnX0cgJ51Iu3JihfKgfw9UMz1RqKMYltXi_RG2Zw"
}
